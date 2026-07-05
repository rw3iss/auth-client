/**
 * `client.auth` — authentication & session lifecycle.
 *
 * Credential entry/exit (password, SSO, magic link), token refresh,
 * org-context switching and the current-identity getters. The
 * session-mutating operations delegate to the core session engine
 * (ctx.core) — single owner of tokens/snapshot/events; the stateless
 * ones (SSO start, registration policy) are implemented here over
 * ctx.flows.
 */
import type { ModuleContext } from '../module-context.js';
import type {
    LoginParams,
    RegisterParams,
    SsoStartParams,
    SsoStartResult,
} from '../auth-client.js';
import type { AuthResponse, User, TokenPair, DecodedAccessToken } from '../types.js';
import type { RegistrationPolicy } from '../flows/apps.flow.js';

export class AuthModule {
    constructor(private readonly ctx: ModuleContext) {}

    /** Password login. On success, persists tokens + emits "authenticated".
     * On 2FA challenge, returns {requires_2fa: true} without throwing.
     * On hard failure (bad password, locked account, etc.), throws. */
    async login(params: LoginParams): Promise<AuthResponse> {
        return this.ctx.core.loginWithPassword(params);
    }

    /** Register a new user. The mode field on the server lets registration
     * also act as login when the email is already known (see auth-server
     * RegistrationMode); the SDK exposes this via the explicit
     * register_or_login parameter. */
    async register(params: RegisterParams): Promise<AuthResponse> {
        return this.ctx.core.register(params);
    }

    /** Begin an SSO sign-in. The SDK auto-generates a PKCE pair, persists
     * the verifier (so a subsequent /sso/callback POST can redeem it), and
     * returns the provider's auth URL for the caller to navigate to. */
    async startSso(params: SsoStartParams): Promise<SsoStartResult> {
        this.ctx.guard('startSso');
        return this.ctx.flows.sso.start(params);
    }

    /** Complete an SSO sign-in. Pass the `code` + `state` the provider
     * redirected back with. The SDK exchanges with the auth-server,
     * handles the PKCE auth_code redemption automatically, and emits
     * "authenticated" on success. */
    async completeSso(params: { code: string; state: string; provider?: string }): Promise<AuthResponse> {
        return this.ctx.core.completeSso(params);
    }

    /**
     * Request a magic-link email. Anonymous flow; server is silent on
     * whether the email is registered.
     *
     * `appCode` defaults to the AuthClient's configured app code so the
     * resulting token-pair scopes correctly. Pass an explicit code to
     * override.
     */
    async requestMagicLink(email: string, appCode?: string): Promise<void> {
        return this.ctx.core.requestMagicLink(email, appCode);
    }

    /**
     * Verify a magic-link token. On success, persists the returned
     * tokens AND emits the `authenticated` event — the AuthClient's
     * snapshot transitions exactly as if the user had logged in via
     * password. Caller's UI can subsequently navigate away.
     *
     * Throws on any error shape; the typical failure is TokenInvalid
     * (unknown / expired / consumed token — all collapsed for
     * anti-enumeration).
     */
    async verifyMagicLink(token: string): Promise<AuthResponse> {
        return this.ctx.core.verifyMagicLink(token);
    }

    /**
     * Fetch the public registration policy for an app. Anonymous —
     * no token required. Useful for rendering the login / register UI
     * BEFORE the user submits: pre-filter SSO buttons against
     * `allowed_auth_methods`, show a domain hint from
     * `allowed_email_domains`. Server still enforces on the actual
     * register/login call. Migration 013.
     *
     * If `appCode` is omitted, defaults to the AuthClient's configured
     * `appCode` (set on construction). Throws if neither is set.
     */
    async getRegistrationPolicy(appCode?: string): Promise<RegistrationPolicy> {
        return this.ctx.core.getRegistrationPolicy(appCode);
    }

    /** Logout the current session — revokes the refresh token server-side,
     * clears local state, emits "logged_out". */
    async logout(): Promise<void> {
        return this.ctx.core.logoutCurrent();
    }

    /** Revoke every refresh token for the current user AND bump the
     * server's per-user token-version so any outstanding access token
     * is immediately invalid cross-replica. AUDIT 1.10. */
    async logoutAll(): Promise<void> {
        return this.ctx.core.logoutAll();
    }

    /**
     * Refresh the access token using the stored refresh token. Coalesced
     * — concurrent calls share one in-flight request.
     *
     * Optional `context` switches the issued token's org and/or app
     * scope. The server honors either or both:
     *   - `organizationId` — re-scope to a different org the user
     *     belongs to. Membership is re-verified each refresh.
     *   - `appCode` — re-scope to a different consuming app.
     *
     * For the common "switch org" case prefer `switchOrg(orgId)` —
     * it's a thinner shorthand that also emits the `org_switched`
     * event so subscribers can react.
     */
    async refresh(context?: { organizationId?: string; appCode?: string }): Promise<TokenPair> {
        return this.ctx.core.refreshAccessToken(context);
    }

    /**
     * Switch the active organization context. Refreshes the token
     * with the new `organization_id`, persists the new token-pair,
     * and emits `org_switched` (in addition to the usual
     * `token_refreshed`).
     *
     * Requires the user to be a member of the target org; the server
     * 403s otherwise and the call throws. Membership is verified
     * server-side on every switch, so a stale `MyOrgRecord` from
     * `getMyOrgs()` won't sneak the caller into an org they were
     * removed from.
     *
     * Pair with `<OrgSwitcher>` for a drop-in UI affordance, or call
     * directly from your own selector.
     */
    async switchOrg(organizationId: string): Promise<TokenPair> {
        return this.ctx.core.switchOrg(organizationId);
    }

    /** Hit /auth/me — the source of truth for the current user. Use this
     * after a permission grant on the server side to refresh local state.
     *
     * The server returns the identity fields flat at the top level
     * (`user_id`, `email`, `first_name`, `roles`, `permissions`, …), not
     * wrapped under a `user` key. Earlier versions of this method did
     * `resp.body.user` and got `undefined` — every consumer crashed on
     * `.display_name` or similar. We now reshape into a `User`-compatible
     * object so callers can rely on the typed return value. */
    async whoami(): Promise<User> {
        return this.ctx.core.whoami();
    }

    /** Current access token, if any. Returns null when logged out. The
     * Transport already attaches this automatically; consumers calling
     * other HTTP clients (axios, etc.) can use this to attach manually. */
    async getAccessToken(): Promise<string | null> {
        return this.ctx.core.getAccessToken();
    }

    /** Are we currently authenticated? Synchronous; reflects cached state.
     * In offline mode this is always false. */
    isAuthenticated(): boolean {
        return this.ctx.core.isAuthenticated();
    }

    /** Decoded claims of the current access token. Null when logged out
     * or token is malformed. Synchronous — reads the cached value. */
    getClaims(): DecodedAccessToken | null {
        return this.ctx.core.getDecodedClaims();
    }

    /** Convenience: current user reconstructed from the decoded token.
     * For a server-authoritative snapshot, call whoami(). */
    getCurrentUser() {
        return this.ctx.core.getCurrentUser();
    }

    /** True if the current session is an impersonation (AUDIT C7). UIs
     * can use this to render an "Acting as X" banner. */
    isImpersonating(): boolean {
        return this.ctx.core.isImpersonating();
    }
}
