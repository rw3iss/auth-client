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
export declare function generatePKCEPair(crypto: Crypto, verifierLength?: number): Promise<PKCEPair>;
/**
 * Derive the S256 challenge: BASE64URL(SHA256(verifier)) without padding.
 * Matches `DeriveS256Challenge` in internal/auth/sso/pkce.go byte-for-byte.
 */
export declare function deriveS256Challenge(crypto: Crypto, verifier: string): Promise<string>;
//# sourceMappingURL=pkce.d.ts.map