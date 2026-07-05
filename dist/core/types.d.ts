/**
 * Public type surface of `@rw3iss/auth-client`.
 *
 * Wire shapes (`User`, `Organization`, `MyOrgRecord`, `TokenPair`,
 * `AuthResponse`) live in `@rw3iss/auth-shared` so server-side consumers
 * (e.g. `@rw3iss/auth-server-ts`) and the browser SDK refer to the
 * exact same definitions. The Go server is the source of truth — keep
 * `@rw3iss/auth-shared/dto` in sync with the auth-server's emitted JSON.
 *
 * Browser-specific shapes (`AuthClientConfig`, `AuthSnapshot`,
 * `DecodedAccessToken`, port interfaces, event types) stay local — they're
 * SDK-architecture concerns, not server contracts.
 *
 * Conventions:
 *   - JSON-on-the-wire field names are snake_case (matching auth-server).
 *     We deliberately do NOT renormalize to camelCase here — keeping the
 *     wire shape in the SDK saves a translation layer and means a user
 *     who logs `tokens` sees the same shape the server emitted.
 *   - Public types are flat / serializable: never function-valued, never
 *     containing closures. So the same shapes can be safely persisted
 *     (e.g., in a token store) or passed across a BroadcastChannel.
 *   - Dates / timestamps are kept in their wire form (RFC3339 string or
 *     Unix-seconds number) to avoid Date object identity quirks across
 *     module boundaries.
 */
import type { User, Organization, MyOrgRecord, TokenPair, AuthResponse } from '@rw3iss/auth-shared';
export type { User, Organization, MyOrgRecord, TokenPair, AuthResponse };
/** Decoded access-token claims. We DO NOT verify the signature on the
 * client — that's the server's job. Decoding is purely for UX: showing
 * the user their email, gating UI on roles/permissions, knowing when to
 * preemptively refresh. Trusting these claims for authorization is
 * incorrect; the SDK never does. */
export interface DecodedAccessToken {
    /** Subject (user id). */
    sub: string;
    /** Token id. */
    jti: string;
    /** Issuer. */
    iss: string;
    /** Audience. */
    aud: string | string[];
    /** Issued-at (unix seconds). */
    iat: number;
    /** Expiry (unix seconds). */
    exp: number;
    /** Not-before (unix seconds). */
    nbf?: number;
    /** Mirrors server's TokenClaims. */
    uid: string;
    email: string;
    first_name?: string;
    last_name?: string;
    display_name?: string;
    org_id?: string;
    org_slug?: string;
    org_name?: string;
    roles?: string[];
    permissions?: string[];
    token_type?: string;
    session_id?: string;
    remember_me?: boolean;
    auth_provider?: string;
    tv?: number;
    app_id?: string;
    app_code?: string;
    /** User pool / namespace (auth-server migration 017). The home pool
     * the identity belongs to; absent for the `default` pool. */
    namespace?: string;
    /** Impersonation stamps (AUDIT C7 — see auth-server claims.go). */
    imp_uid?: string;
    imp_email?: string;
}
/** Configuration for createAuthClient — every field is optional except
 * apiBaseUrl. Defaults give a sensible browser experience. */
export interface AuthClientConfig {
    /** Base URL of the auth-server, e.g. "https://auth.ryanweiss.net/api/v1".
     * No trailing slash. The SDK appends "/auth/login" etc. */
    apiBaseUrl: string;
    /** App scoping — required by the auth-server unless
     * AUTH_ALLOW_BASE_USER_LOGIN is set. Persists across the session. */
    appCode?: string;
    /** Storage namespace prefix for token-store keys. Lets two installs of
     * the SDK on the same origin coexist without colliding (e.g.,
     * marketplace + admin in the same tab). Default: "rw3iss_auth". */
    storageNamespace?: string;
    /** Refresh leeway in seconds — when the access token is within this
     * window of expiry, the SDK preemptively refreshes on the next
     * fetch interception. Default: 60. */
    refreshLeewaySeconds?: number;
    /** When true (default), the SDK attaches an Authorization header to
     * fetch calls made via the package's HTTP helper. Disable if your app
     * uses cookie-based auth (set HttpOnly cookie via /auth/login). */
    attachAuthHeader?: boolean;
    /** Per-tab default: false. When true, the SDK uses BroadcastChannel to
     * publish auth events ("authenticated", "loggedOut") so multiple tabs
     * stay in sync. Falls back to a no-op when BroadcastChannel is
     * unavailable (older browsers / SSR). */
    enableCrossTabSync?: boolean;
    /** Strategy for the initial auth check at construction time.
     *
     *   - 'auto' (default): on construct, the client reads cached tokens,
     *     refreshes if near-expiry, and confirms the session via
     *     /auth/me. ready() resolves once that handshake completes (or
     *     fails). UIs typically gate their first render on ready().
     *   - 'lazy': skip the proactive check. Trust the cached state until
     *     the first request fails. Cheaper boot, at the cost of
     *     possibly rendering an authenticated UI for a tick before the
     *     server tells us otherwise.
     *   - 'offline': disable all auth. isAuthenticated() returns false,
     *     getCurrentUser() returns null. Flow methods that would make a
     *     network call throw OfflineModeError. Useful for embedding the
     *     SDK in static demos / styleguides / Storybook.
     */
    bootstrap?: 'auto' | 'lazy' | 'offline';
    /** When true, the SDK auto-refreshes + retries on 401 for calls made
     * through authenticatedRequest(). On refresh failure, emits
     * session_expired and clears local state. Default true. */
    autoRetryOn401?: boolean;
    /** When true, the SDK schedules a background refresh ~`refreshLeewaySeconds`
     *  before the cached access token expires. An actively-used app
     *  re-mints transparently — the snapshot never flips to 'anonymous'.
     *  Default true.
     *
     *  Disable for: SSR contexts (no need to schedule on the server),
     *  test harnesses that drive the clock manually, or any environment
     *  where a long-running timer would leak. */
    autoRefresh?: boolean;
    /** Optional client-side inactivity policy. When set, the SDK starts
     *  an IdleTracker that watches DOM activity (pointer/keyboard/scroll/
     *  visibility) and clears local auth state after `idleTimeoutMs` of
     *  inactivity, signing the user out locally. The server-side refresh
     *  token remains valid until its natural exp; the user re-logs in via
     *  the normal login flow.
     *
     *  Browser-only. Has no effect in non-DOM environments.
     *
     *  Recommended values: 15-30 minutes for sensitive admin tooling,
     *  60+ minutes for general consumer apps. Leave undefined (the
     *  default) for "stay signed in as long as the refresh token is
     *  valid" semantics — the common consumer-app pattern. */
    idleTimeoutMs?: number;
    /** Override the default ports (storage, transport, etc.) — see
     * AuthClientPorts. Useful for SSR (memory storage, fetch polyfill) or
     * tests (deterministic clock, instrumented transport). */
    ports?: Partial<AuthClientPorts>;
}
/** Lifecycle state of an AuthClient. Adapters typically project this
 * into their idiomatic reactive primitive so UIs can render the right
 * thing per phase. */
export type AuthStatus = 
/** Boot in progress (bootstrap='auto' is verifying the cached
 * session). Cached claims may be present but unconfirmed. */
'bootstrapping'
/** User is authenticated. getCurrentUser() / getDecodedClaims() are
 * meaningful. */
 | 'authenticated'
/** No active session. Login / SSO / register methods are the
 * intended next step. */
 | 'anonymous'
/** bootstrap='offline'. All flow methods throw OfflineModeError. */
 | 'offline';
/** Snapshot of the client's reactive state. Framework adapters subscribe
 * to changes and project this into their primitive. Stable identity:
 * unchanged status + claims yields the same object reference so
 * useSyncExternalStore-style hooks don't re-render unnecessarily. */
export interface AuthSnapshot {
    status: AuthStatus;
    ready: boolean;
    user: {
        id: string;
        email: string;
    } | null;
    claims: DecodedAccessToken | null;
    isImpersonating: boolean;
    error: Error | null;
}
/** All injectable ports. Each has a default in core/adapters/ — supply a
 * value here to override. */
export interface AuthClientPorts {
    tokenStore: TokenStore;
    transport: Transport;
    storage: Storage;
    clock: Clock;
    crypto: Crypto;
    logger: Logger;
    broadcast: Broadcast;
}
/** Persists the active token pair. The default uses localStorage; a
 * cookie-based or HttpOnly-cookie variant can be swapped in. */
export interface TokenStore {
    get(): Promise<StoredTokens | null>;
    set(tokens: StoredTokens): Promise<void>;
    clear(): Promise<void>;
}
/** Persisted token shape. Matches TokenPair on the wire — kept verbatim
 * so refresh can submit the original refresh_token unchanged. */
export interface StoredTokens {
    access_token: string;
    refresh_token: string;
    expires_at_seconds: number;
}
/** Wraps fetch. The default is a thin fetch wrapper that attaches the
 * Authorization header when the SDK has a token. Custom impls can add
 * retry, circuit breaking, observability, etc. */
export interface Transport {
    request<T = unknown>(input: TransportRequest): Promise<TransportResponse<T>>;
}
export interface TransportRequest {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    url: string;
    headers?: Record<string, string>;
    body?: unknown;
    /** If true, the transport SKIPS attaching the Authorization header even
     * if a token exists. Used by /auth/login etc. to avoid leaking an old
     * token's identity into a new login attempt. */
    skipAuth?: boolean;
    /** Abort signal — used by long-running calls and tests. */
    signal?: AbortSignal;
}
export interface TransportResponse<T = unknown> {
    status: number;
    ok: boolean;
    body: T;
    headers: Record<string, string>;
}
/** Generic key-value persistence for non-token data: PKCE verifiers
 * between /sso/url and /sso/exchange, last-known org id, etc. */
export interface Storage {
    get(key: string): Promise<string | null>;
    set(key: string, value: string): Promise<void>;
    remove(key: string): Promise<void>;
}
/** Time source. Indirected so tests can pin the clock. */
export interface Clock {
    nowSeconds(): number;
}
/** Cryptographic primitives. The browser default is WebCrypto; an SSR
 * adapter can plug in Node's built-in webcrypto via globalThis. */
export interface Crypto {
    /** Returns `length` cryptographically-secure random bytes. */
    randomBytes(length: number): Uint8Array;
    /** Computes SHA-256(input). Returns the raw 32-byte digest. */
    sha256(input: Uint8Array): Promise<Uint8Array>;
}
/** Logger port. The default routes to console at info+; pass NoOpLogger
 * in production or a structured logger in advanced setups. */
export interface Logger {
    debug(msg: string, fields?: Record<string, unknown>): void;
    info(msg: string, fields?: Record<string, unknown>): void;
    warn(msg: string, fields?: Record<string, unknown>): void;
    error(msg: string, fields?: Record<string, unknown>): void;
}
/** Cross-tab event channel. Default uses BroadcastChannel; SSR + older
 * browsers fall back to a no-op. */
export interface Broadcast {
    publish(message: BroadcastMessage): void;
    subscribe(handler: (message: BroadcastMessage) => void): () => void;
    close(): void;
}
export interface BroadcastMessage {
    type: 'authenticated' | 'logged_out' | 'token_refreshed';
    /** Optional payload — currently just the user id for cheapness. */
    user_id?: string;
}
export type AuthEvent = {
    type: 'authenticated';
    user: User;
    tokens: TokenPair;
} | {
    type: 'logged_out';
    reason: LogoutReason;
} | {
    type: 'token_refreshed';
    tokens: TokenPair;
} | {
    type: 'requires_two_factor';
    email: string;
} | {
    type: 'session_expired';
} | {
    type: 'status_changed';
    status: AuthStatus;
    snapshot: AuthSnapshot;
} | {
    type: 'org_switched';
    organizationId: string;
    tokens: TokenPair;
} | {
    type: 'error';
    error: Error;
};
export type LogoutReason = 'user_initiated' | 'session_expired' | 'token_revoked' | 'cross_tab_sync' | 'idle_timeout';
export type AuthEventType = AuthEvent['type'];
export type AuthEventHandler<T extends AuthEventType = AuthEventType> = (event: Extract<AuthEvent, {
    type: T;
}>) => void;
//# sourceMappingURL=types.d.ts.map