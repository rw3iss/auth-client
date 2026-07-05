/**
 * AuthClient — the facade.
 *
 * Composes the seven ports (token-store, transport, storage, clock,
 * crypto, logger, broadcast) into a small, opinionated public surface.
 * Every flow (login, refresh, sso, totp, etc.) is a method here; under
 * the hood, each method delegates to a private flow module so the
 * facade stays a thin orchestration layer.
 *
 * Architectural shape:
 *
 *   AuthClient ──┬── ports (injectable, default = browser-native)
 *                ├── EventEmitter (typed bus for "authenticated", etc.)
 *                ├── RefreshMutex (coalesces concurrent refreshes)
 *                ├── Cross-tab subscriber (listens to BroadcastChannel)
 *                └── flow methods (login, sso, totp, …)
 *
 * The facade owns:
 *   - Token persistence (read from store, write after every auth event)
 *   - Authorization-header attachment via the Transport
 *   - Event emission on every state transition
 *   - The single-flight refresh primitive
 *   - Cross-tab synchronization
 *
 * Flows are exported separately too — a consumer with very custom needs
 * (e.g., a Cordova app that handles SSO differently) can compose them
 * directly without going through the facade.
 *
 * The facade is INTENDED to be wrapped by framework adapters:
 *
 *   - React: `useAuth()` hook that subscribes to events and reads state.
 *   - Preact: same.
 *   - Solid: a createAuth() store that fires reactions on events.
 *   - Astro: a server-side helper that reads tokens from cookies + a
 *     client-side island that uses the same hooks.
 *
 * Adapters live in src/framework-adapters/. Their job is purely to
 * translate the EventEmitter into framework-idiomatic primitives — no
 * business logic.
 */
import type { RegistrationPolicy } from './flows/apps.flow.js';
import { AuthModule, AccountModule, SessionsModule, UsersModule, OrganizationsModule, AppsModule, ServicesModule, PoolsModule, AuditModule } from './modules/index.js';
import type { AuthClientConfig, AuthEventHandler, AuthEventType, AuthResponse, AuthSnapshot, AuthStatus, DecodedAccessToken, MyOrgRecord, TokenPair, TransportRequest, TransportResponse, User } from './types.js';
/** Default values for AuthClientConfig fields. Exposed so tests can
 * reference the same defaults the constructor uses. */
export declare const DEFAULTS: {
    readonly storageNamespace: "vendidit_auth";
    readonly refreshLeewaySeconds: 60;
    readonly attachAuthHeader: true;
    readonly enableCrossTabSync: true;
    readonly bootstrap: "auto";
    readonly autoRetryOn401: true;
    readonly autoRefresh: true;
};
export interface LoginParams {
    email: string;
    password: string;
    organizationId?: string;
    rememberMe?: boolean;
    twoFactorCode?: string;
}
export interface SsoStartParams {
    provider: string;
    redirectUrl: string;
    organizationId?: string;
    inviteCode?: string;
}
export interface SsoStartResult {
    authUrl: string;
    state: string;
    /** The PKCE verifier — caller must keep it (the SDK persists it in
     * its Storage port already, but it's returned here so a consumer
     * can also keep their own copy). */
    codeVerifier: string;
}
export interface RegisterParams {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    organizationId?: string;
    organizationName?: string;
    inviteCode?: string;
    inviteToken?: string;
    appCode?: string;
}
export interface ImpersonateParams {
    targetUserId: string;
    reason: string;
}
/**
 * The SDK core — owns authentication context (tokens, session snapshot,
 * refresh scheduling, cross-tab sync) and exposes the API surface two
 * ways:
 *
 * **Namespaced modules** (recommended): {@link AuthClient.auth | client.auth},
 * {@link AuthClient.account | client.account}, {@link AuthClient.sessions | client.sessions},
 * {@link AuthClient.users | client.users}, {@link AuthClient.organizations | client.organizations},
 * {@link AuthClient.apps | client.apps}, {@link AuthClient.services | client.services},
 * {@link AuthClient.pools | client.pools}, {@link AuthClient.audit | client.audit}.
 *
 * The endpoint implementations live in the modules (src/core/modules/*);
 * this class is the **session engine**: config, ports, reactive
 * snapshot, token storage/refresh, cross-tab sync, and the
 * session-mutating operations the modules delegate back to
 * (see module-context.ts for the architecture diagram).
 */
export declare class AuthClient {
    private readonly config;
    private readonly ports;
    private readonly events;
    private readonly refreshMutex;
    private readonly login;
    private readonly logout;
    private readonly refresh;
    private readonly registration;
    private readonly sso;
    private readonly totp;
    private readonly impersonation;
    private readonly admin;
    private readonly password;
    private readonly emailVerification;
    private readonly sessionsFlow;
    private readonly orgFlow;
    private readonly appsFlow;
    private readonly m2mFlow;
    private readonly namespacesFlow;
    private readonly magicLinkFlow;
    private readonly auditLogFlow;
    private readonly unsubscribeCrossTab;
    private readonly refreshScheduler;
    private readonly idleTracker;
    private destroyed;
    /** Cached access-token claims — refreshed every time tokens change. */
    private cachedClaims;
    private currentStatus;
    private isReady_;
    private lastError;
    private currentSnapshot;
    private readonly subscribers;
    private readyResolve;
    private readonly readyPromise;
    readonly auth: AuthModule;
    readonly account: AccountModule;
    readonly sessions: SessionsModule;
    readonly users: UsersModule;
    readonly organizations: OrganizationsModule;
    readonly apps: AppsModule;
    readonly services: ServicesModule;
    readonly pools: PoolsModule;
    readonly audit: AuditModule;
    constructor(config: AuthClientConfig);
    private runBootstrap;
    private finishBootstrap;
    /** Snapshot of the current reactive state. Reference-stable: the
     * same object is returned until something changes. Adapters use
     * this with useSyncExternalStore / createMemo / computed. */
    getSnapshot(): AuthSnapshot;
    /** Subscribe to snapshot changes. Returns the unsubscribe function.
     * Adapters typically register one subscriber per component instance
     * via their framework's effect primitive. */
    subscribe(listener: (snapshot: AuthSnapshot) => void): () => void;
    /** Resolves with the current snapshot once bootstrap completes. UIs
     * gate their first authenticated render on this — a splash screen
     * shows while ready() is pending. */
    ready(): Promise<AuthSnapshot>;
    /** True once bootstrap (auto / lazy / offline) has finished. */
    isReady(): boolean;
    /** Current lifecycle status. Equivalent to getSnapshot().status. */
    getStatus(): AuthStatus;
    /** True when the client is configured offline. All flow methods
     * throw OfflineModeError; read-state methods return null/false. */
    isOfflineMode(): boolean;
    /** Subscribe to an event. Returns the unsubscribe function. */
    on<T extends AuthEventType>(type: T, handler: AuthEventHandler<T>): () => void;
    /** Manual unsubscribe — usually use the return of on() instead. */
    off<T extends AuthEventType>(type: T, handler: AuthEventHandler<T>): void;
    /** Are we currently authenticated? Synchronous; reflects cached state.
     * In offline mode this is always false. */
    isAuthenticated(): boolean;
    /** Current access token, if any. Returns null when logged out. The
     * Transport already attaches this automatically; consumers calling
     * other HTTP clients (axios, etc.) can use this to attach manually. */
    getAccessToken(): Promise<string | null>;
    /** Decoded claims of the current access token. Null when logged out
     * or token is malformed. Synchronous — reads the cached value. */
    getDecodedClaims(): DecodedAccessToken | null;
    /** Convenience: current user as a User object, reconstructed from the
     * decoded token. For a server-authoritative snapshot, call
     * whoami() — it hits /auth/me. */
    getCurrentUser(): {
        id: string;
        email: string;
    } | null;
    /** True if the current session is an impersonation (AUDIT C7). UIs
     * can use this to render an "Acting as X" banner. */
    isImpersonating(): boolean;
    /** Password login. On success, persists tokens + emits "authenticated".
     * On 2FA challenge, returns {requires_2fa: true} without throwing.
     * On hard failure (bad password, locked account, etc.), throws. */
    loginWithPassword(params: LoginParams): Promise<AuthResponse>;
    /** Complete an SSO sign-in. Pass the `code` + `state` the provider
     * redirected back with. The SDK exchanges with the auth-server,
     * handles the PKCE auth_code redemption automatically, and emits
     * "authenticated" on success. */
    completeSso(params: {
        code: string;
        state: string;
        provider?: string;
    }): Promise<AuthResponse>;
    /** Register a new user. The mode field on the server lets registration
     * also act as login when the email is already known (see auth-server
     * RegistrationMode); the SDK exposes this via the explicit
     * register_or_login parameter. */
    register(params: RegisterParams): Promise<AuthResponse>;
    /** Logout the current session — revokes the refresh token server-side,
     * clears local state, emits "logged_out". */
    logoutCurrent(): Promise<void>;
    /** Revoke every refresh token for the current user AND bump the
     * server's per-user token-version so any outstanding access token
     * is immediately invalid cross-replica. AUDIT 1.10. */
    logoutAll(): Promise<void>;
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
    refreshAccessToken(context?: {
        organizationId?: string;
        appCode?: string;
    }): Promise<TokenPair>;
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
    switchOrg(organizationId: string): Promise<TokenPair>;
    /** Hit /auth/me — the source of truth for the current user. Use this
     * after a permission grant on the server side to refresh local state.
     *
     * The server returns the identity fields flat at the top level
     * (`user_id`, `email`, `first_name`, `roles`, `permissions`, …), not
     * wrapped under a `user` key. Earlier versions of this method did
     * `resp.body.user` and got `undefined` — every consumer crashed on
     * `.display_name` or similar. We now reshape into a `User`-compatible
     * object so callers can rely on the typed return value. */
    whoami(): Promise<User>;
    /**
     * GET /me/orgs — the authenticated user's organization memberships.
     * Self-service mirror of getMyApps() / /me/apps. Lets UIs render an
     * org-switcher without admin scope (AUTH-PHP-LARAVEL-DESIGN §5).
     *
     * Returns the raw `organizations` array; consumers map it to their
     * own UI shape. The response shape matches the admin variant so a
     * shared renderer can take either source.
     */
    getMyOrgs(): Promise<MyOrgRecord[]>;
    /**
     * Issue an authenticated HTTP request against an arbitrary URL. On
     * 401, the SDK refreshes (under the mutex) and retries once. On
     * refresh failure, it emits session_expired and clears local state
     * before re-throwing the original 401.
     *
     * Use this for downstream service calls that share the same JWT —
     * e.g., a marketplace API endpoint that validates the auth-server's
     * token locally. The retry semantics handle the racy "token expired
     * between our last refresh and this call" case without the consumer
     * writing it themselves.
     *
     * Disable the retry via config.autoRetryOn401 = false. Calls that
     * are themselves to /auth/refresh skip the retry to avoid a loop.
     */
    authenticatedRequest<T = unknown>(req: TransportRequest): Promise<TransportResponse<T>>;
    /** Turn 2FA off — requires the current password + a fresh code. */
    disableTwoFactor(params: {
        password: string;
        code: string;
    }): Promise<void>;
    /** Impersonate another user (AUDIT C7). The caller's token must carry
     * a role authorized for impersonation (system_admin / super_admin
     * anywhere, org_admin within their org). On success, the SDK swaps
     * in the new token pair so subsequent requests act as the target. */
    impersonate(params: ImpersonateParams): Promise<AuthResponse>;
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
    /**
     * Enabled SSO providers for this deployment (lower-cased names, e.g.
     * `['google','github']`). Public; no auth. Empty when none are
     * enabled — callers hide their SSO UI instead of showing dead buttons.
     */
    getSsoProviders(): Promise<string[]>;
    getRegistrationPolicy(appCode?: string): Promise<RegistrationPolicy>;
    /**
     * Request a magic-link email. Anonymous flow; server is silent on
     * whether the email is registered.
     *
     * `appCode` defaults to the AuthClient's configured app code so the
     * resulting token-pair scopes correctly. Pass an explicit code to
     * override.
     */
    requestMagicLink(email: string, appCode?: string): Promise<void>;
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
    verifyMagicLink(token: string): Promise<AuthResponse>;
    /**
     * Delete the caller's own account. Calls DELETE /me/account with
     * the user's current password + a typed "DELETE" confirmation
     * (the server enforces both — we don't try to be clever here).
     * On success, the AuthClient's snapshot transitions to anonymous
     * (the access token's tv claim is bumped server-side, refresh row
     * was cascade-deleted with the user row).
     */
    deleteMyAccount(currentPassword: string): Promise<void>;
    /** Tear down — unsubscribes from cross-tab, clears event listeners.
     * Called by the host app on unmount; subsequent calls are no-ops. */
    destroy(): void;
    private persistAndAnnounce;
    /**
     * Refuse a flow call when the client is offline. Read-state methods
     * (isAuthenticated, getCurrentUser) silently return null/false; only
     * methods that would otherwise issue a network request throw, so the
     * "I forgot to set bootstrap to online" failure is loud.
     */
    private assertOnline;
    /**
     * Move to a new lifecycle status + rebuild the snapshot. No-op when
     * the status didn't change and ready hasn't flipped.
     */
    private transitionTo;
    /**
     * Recompute status from cached claims. Called after a refresh, a
     * cross-tab sync, or a logout. {initial: true} suppresses the
     * status_changed event emission for the constructor-time recompute
     * (we'll emit once when bootstrap finalizes).
     */
    private recomputeStatus;
    /**
     * Build a fresh snapshot from the current state, store it, and
     * notify subscribers if the value changed. Reference-stable when
     * inputs are unchanged.
     */
    private emitSnapshot;
    private persistTokens;
    /**
     * Background refresh tick. Called from the RefreshScheduler's
     * setTimeout. Guards: skip if no token (logged out between schedule
     * and fire), skip if the idle tracker says we're idle (let the
     * token expire naturally; onIdle will clear state). Swallows
     * errors — we let the autoRetryOn401 path handle the next request
     * if this fails.
     */
    private handleScheduledRefresh;
    /**
     * Idle-timeout handler. Best-effort local sign-out: clear stored
     * tokens, drop cached claims, flip to 'anonymous'. The refresh
     * token stays valid server-side until its natural exp — the user
     * just has to sign in again to use this device. Compare to
     * `logoutCurrent()` which also notifies the server.
     */
    private handleIdleTimeout;
    private parseExpiresAt;
    private refreshCachedClaims;
    private getAccessTokenForTransport;
    private isExpired;
    private clearAndAnnounce;
    /** Handle a cross-tab broadcast message. The sending tab already
     * updated its own state + persisted tokens to localStorage; we just
     * mirror by reloading from the store and emitting matching events. */
    private handleCrossTabMessage;
}
/** Convenience factory — equivalent to `new AuthClient(config)` but reads
 * idiomatically in app boot code. */
export declare function createAuthClient(config: AuthClientConfig): AuthClient;
//# sourceMappingURL=auth-client.d.ts.map