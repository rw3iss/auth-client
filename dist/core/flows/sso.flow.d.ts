/**
 * SSO flow with PKCE (AUDIT C2 — wire-compatible with the auth-server
 * implementation in internal/auth/sso/).
 *
 * Two phases:
 *
 *   1. start(): generates a PKCE pair, persists the verifier (so the
 *      eventual callback can redeem it even across page reloads), POSTs
 *      to /auth/sso/url, and returns the provider's authorization URL +
 *      state for the browser to navigate to.
 *
 *   2. complete(): handles the callback. POSTs to /auth/sso/callback;
 *      the server returns either:
 *        a. {auth_code, expires_in} — PKCE was in flight. The SDK
 *           automatically exchanges via /auth/sso/exchange with the
 *           persisted verifier, returns the final token pair.
 *        b. {user, tokens, …} — PKCE was not in flight (non-PKCE flow).
 *           Pass-through.
 *
 * Persistence of the verifier in Storage means a redirect dance survives
 * a full-page navigation: tab opens → start() → navigate to provider →
 * provider redirects back → complete() reads the verifier and finishes.
 */
import type { AuthResponse } from '../types.js';
import { type FlowDeps } from './flow-deps.js';
export interface SsoStartRequest {
    provider: string;
    redirectUrl: string;
    organizationId?: string | undefined;
    inviteCode?: string | undefined;
}
export interface SsoStartResult {
    authUrl: string;
    state: string;
    codeVerifier: string;
}
export interface SsoCompleteRequest {
    code: string;
    state: string;
    provider?: string | undefined;
}
export declare class SsoFlow {
    private readonly deps;
    constructor(deps: FlowDeps);
    start(req: SsoStartRequest): Promise<SsoStartResult>;
    /**
     * Enabled SSO providers for this deployment, lower-cased names
     * (e.g. `['google', 'github']`). Public + auth-free. Returns `[]`
     * gracefully on any failure (offline, 4xx/5xx) so callers can hide
     * their SSO UI rather than show buttons that can't work.
     */
    getEnabledProviders(): Promise<string[]>;
    complete(req: SsoCompleteRequest): Promise<AuthResponse>;
    private clearPersistedPkce;
}
//# sourceMappingURL=sso.flow.d.ts.map