/**
 * Magic-link sign-in flow.
 *
 *   - `request(email)` — anonymous; emails the user a one-tap link.
 *     Server responds 204 regardless of whether the email is
 *     registered (anti-enumeration). Client gets no signal either way.
 *
 *   - `verify(token)` — anonymous; consumes the link, returns a full
 *     token pair (same shape as /auth/login). Single-use: a second
 *     verify of the same token rejects with TokenInvalid.
 *
 * Token lifetime: 15 minutes on the server (migration 014). Failed
 * verifies (unknown / expired / consumed) all return the same error
 * shape so a caller can't enumerate state.
 */
import { type FlowDeps } from './flow-deps.js';
import type { AuthResponse } from '../types.js';
export interface MagicLinkRequest {
    email: string;
    /** Optional app code — scopes the resulting token-pair to this app
     *  (same as /auth/login's app_code). Defaults server-side to
     *  AUTH_DEFAULT_APP_CODE. */
    appCode?: string;
}
export interface MagicLinkVerifyRequest {
    /** The raw token from the email URL (the query-string `?token=...`). */
    token: string;
}
export declare class MagicLinkFlow {
    private readonly deps;
    constructor(deps: FlowDeps);
    /** POST /auth/magic-link/request — silent on whether the email exists. */
    request(req: MagicLinkRequest): Promise<void>;
    /**
     * POST /auth/magic-link/verify — exchange a token for a token-pair.
     * Returns the same AuthResponse shape as /auth/login, so the
     * AuthClient facade can persist tokens + transition state through
     * the same code path.
     */
    verify(req: MagicLinkVerifyRequest): Promise<AuthResponse>;
}
//# sourceMappingURL=magic-link.flow.d.ts.map