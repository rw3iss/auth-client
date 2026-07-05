/**
 * PKCE (RFC 7636) — Proof Key for Code Exchange. Browser-side counterpart
 * of `internal/auth/sso/pkce.go`. Same wire format; identical derivation.
 *
 * The flow:
 *
 *   1. Browser generates a high-entropy code_verifier (43..128 chars from
 *      the unreserved base64url alphabet).
 *   2. Browser derives code_challenge = BASE64URL(SHA256(verifier)) and
 *      submits {challenge, method: "S256"} to /auth/sso/url.
 *   3. Server stashes the challenge alongside state.
 *   4. After OAuth roundtrip, server returns {auth_code, expires_in}
 *      instead of tokens.
 *   5. Browser POSTs {auth_code, code_verifier} to /auth/sso/exchange;
 *      server verifies SHA256(verifier) matches the stashed challenge.
 *
 * Why we re-implement on the client rather than relying on a third-party
 * library:
 *   - The crypto primitives are tiny (one SHA-256 + base64url-encode).
 *   - We get to pin the exact wire format to the server's expectations
 *     (no padding, S256 only).
 *   - Crypto provider is injectable via the Crypto port — SSR /
 *     no-WebCrypto environments can swap in a polyfill.
 */

import type { Crypto } from './types.js';

/** RFC 7636 §4.1 verifier alphabet: [A-Za-z0-9-._~]. We pick from this
 * set explicitly rather than base64-encoding random bytes — the latter
 * would yield characters outside the unreserved set (+, /, =). */
const VERIFIER_ALPHABET =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';

/** Default verifier length. 64 chars = ~384 bits of entropy when sampled
 * uniformly from the 66-char alphabet. RFC 7636 mandates 43..128; 64 is
 * the sweet spot — strong enough to brute-force-resist and short enough
 * to keep the auth URL compact. */
const DEFAULT_VERIFIER_LENGTH = 64;

/** Output of generatePKCEPair — the verifier stays on the client, the
 * challenge + method go to the server. */
export interface PKCEPair {
    verifier: string;
    challenge: string;
    method: 'S256';
}

/**
 * Generate a fresh PKCE pair. Each call returns a cryptographically
 * independent verifier — the SDK pairs one per SSO attempt and discards
 * after exchange.
 *
 * @param crypto Crypto port for randomBytes + sha256.
 * @param verifierLength Override the default 64 chars. Must be 43..128.
 */
export async function generatePKCEPair(
    crypto: Crypto,
    verifierLength: number = DEFAULT_VERIFIER_LENGTH,
): Promise<PKCEPair> {
    if (verifierLength < 43 || verifierLength > 128) {
        throw new Error(`PKCE verifier length must be 43..128, got ${verifierLength}`);
    }
    const verifier = generateVerifier(crypto, verifierLength);
    const challenge = await deriveS256Challenge(crypto, verifier);
    return { verifier, challenge, method: 'S256' };
}

/**
 * Generate a code_verifier using rejection sampling from the unreserved
 * alphabet. We over-sample random bytes (1.5x the target length) so the
 * rejection rate per attempt is well under 1, then trim. This gives a
 * uniform distribution over the 66-char alphabet — important because a
 * non-uniform sampler would reduce effective entropy.
 *
 * Why not base64url-encode random bytes? Because base64 uses 64 chars
 * (A-Z, a-z, 0-9, -, _) but RFC 7636's unreserved set has 66 chars
 * (adds `.` and `~`). The two-char difference is a stylistic choice in
 * the spec; we use the 66-char alphabet for spec fidelity, which means
 * we can't shortcut through base64.
 */
function generateVerifier(crypto: Crypto, length: number): string {
    const result: string[] = [];
    while (result.length < length) {
        const bytes = crypto.randomBytes(length * 2);
        for (let i = 0; i < bytes.length && result.length < length; i++) {
            const idx = bytes[i] ?? 0;
            // Rejection sampling: 256 mod 66 = 58, so byte values 0..253
            // map uniformly to alphabet indices 0..65. Reject 254 + 255 to
            // preserve uniformity. The reject rate is 2/256 = 0.78% — well
            // worth the cost.
            if (idx >= 254) continue;
            result.push(VERIFIER_ALPHABET[idx % VERIFIER_ALPHABET.length]!);
        }
    }
    return result.join('');
}

/**
 * Derive the S256 challenge: BASE64URL(SHA256(verifier)) without padding.
 * Matches `DeriveS256Challenge` in internal/auth/sso/pkce.go byte-for-byte.
 */
export async function deriveS256Challenge(
    crypto: Crypto,
    verifier: string,
): Promise<string> {
    const bytes = new TextEncoder().encode(verifier);
    const digest = await crypto.sha256(bytes);
    return base64UrlEncodeNoPadding(digest);
}

/**
 * base64url-encode WITHOUT trailing padding. The spec accepts both forms;
 * we match the server's no-padding output (see Go's
 * `base64.RawURLEncoding.EncodeToString`).
 */
function base64UrlEncodeNoPadding(bytes: Uint8Array): string {
    // btoa works on Latin-1 strings; convert the byte array via String
    // .fromCharCode for the smallest dependency footprint. Performance is
    // fine for the 32-byte digest we feed it.
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]!);
    }
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
