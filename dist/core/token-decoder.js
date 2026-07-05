/**
 * JWT decode without signature verification. The SDK never trusts these
 * values for authorization — that's the server's job — but they're useful
 * for UX:
 *
 *   - Reading `exp` so we know when to preemptively refresh.
 *   - Reading `email` / `roles` / `permissions` so a UI can render the
 *     current user's view without an extra /auth/me roundtrip.
 *   - Detecting `imp_uid` so an "Acting as X" banner can render
 *     immediately after impersonation.
 *
 * If you find yourself tempted to gate authorization on a decoded claim
 * here, STOP. The server is the source of truth; this is decoration only.
 *
 * The decoder accepts the standard three-segment JWT and returns the
 * payload as a plain object. Signature segment is ignored. Header is
 * checked only for the `alg` field — we refuse `none` (RFC 7518 §3.6) as
 * a defense against accidental misuse.
 */
export class InvalidTokenError extends Error {
    constructor(message) {
        super(message);
        this.name = 'InvalidTokenError';
    }
}
/** Decode an access token's payload. Throws InvalidTokenError on
 * malformed input. Does NOT verify the signature. */
export function decodeAccessToken(token) {
    const parts = token.split('.');
    if (parts.length !== 3) {
        throw new InvalidTokenError('token must have three dot-separated segments');
    }
    const [headerPart, payloadPart] = parts;
    if (!headerPart || !payloadPart) {
        throw new InvalidTokenError('token segments must be non-empty');
    }
    const header = parseJsonSegment(headerPart, 'header');
    if (header['alg'] === 'none') {
        throw new InvalidTokenError('alg=none is not accepted');
    }
    const payload = parseJsonSegment(payloadPart, 'payload');
    // Cast through unknown: we don't validate the payload shape here
    // (the server is the source of truth); the type assertion documents
    // the expected shape for consumers.
    return payload;
}
/**
 * Return the number of seconds until `exp`. Negative when already
 * expired. Callers use this to decide whether to refresh preemptively.
 */
export function secondsUntilExpiry(token, nowSeconds) {
    return token.exp - nowSeconds;
}
/** Best-effort decode that swallows errors. Returns null on any failure.
 * Used at boot when a stored token may be malformed — we don't want a
 * boot crash, just a clean re-login. */
export function tryDecodeAccessToken(token) {
    try {
        return decodeAccessToken(token);
    }
    catch {
        return null;
    }
}
function parseJsonSegment(segment, what) {
    let json;
    try {
        json = base64UrlDecode(segment);
    }
    catch (err) {
        throw new InvalidTokenError(`${what} segment is not valid base64url: ${errorMessage(err)}`);
    }
    let parsed;
    try {
        parsed = JSON.parse(json);
    }
    catch (err) {
        throw new InvalidTokenError(`${what} segment is not valid JSON: ${errorMessage(err)}`);
    }
    if (typeof parsed !== 'object' || parsed === null) {
        throw new InvalidTokenError(`${what} segment must decode to an object`);
    }
    return parsed;
}
/**
 * Decode base64url to UTF-8 string. atob handles standard base64; we
 * map URL-safe chars + restore padding before invoking it.
 *
 * Implementation note: a robust decoder needs to round-trip multibyte
 * UTF-8 sequences (emoji in display_name, accented chars in names). We
 * convert atob's Latin-1 string output to bytes via charCodeAt, then
 * decode with TextDecoder. This is the canonical browser-side pattern.
 */
function base64UrlDecode(s) {
    const normalized = s.replace(/-/g, '+').replace(/_/g, '/');
    // Restore padding. Length mod 4: 0=no pad, 2=two pads, 3=one pad.
    // (1 is invalid base64.)
    const pad = normalized.length % 4 === 0 ? '' : '='.repeat(4 - (normalized.length % 4));
    const binary = atob(normalized + pad);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
}
function errorMessage(err) {
    if (err instanceof Error)
        return err.message;
    return String(err);
}
//# sourceMappingURL=token-decoder.js.map