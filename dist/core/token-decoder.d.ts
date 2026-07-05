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
import type { DecodedAccessToken } from './types.js';
export declare class InvalidTokenError extends Error {
    constructor(message: string);
}
/** Decode an access token's payload. Throws InvalidTokenError on
 * malformed input. Does NOT verify the signature. */
export declare function decodeAccessToken(token: string): DecodedAccessToken;
/**
 * Return the number of seconds until `exp`. Negative when already
 * expired. Callers use this to decide whether to refresh preemptively.
 */
export declare function secondsUntilExpiry(token: DecodedAccessToken, nowSeconds: number): number;
/** Best-effort decode that swallows errors. Returns null on any failure.
 * Used at boot when a stored token may be malformed — we don't want a
 * boot crash, just a clean re-login. */
export declare function tryDecodeAccessToken(token: string): DecodedAccessToken | null;
//# sourceMappingURL=token-decoder.d.ts.map