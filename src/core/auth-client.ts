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

import {
    EventEmitter,
} from './event-emitter.js';
import { RefreshMutex } from './refresh-mutex.js';
import { tryDecodeAccessToken } from './token-decoder.js';
import { LoginFlow } from './flows/login.flow.js';
import { LogoutFlow } from './flows/logout.flow.js';
import { RefreshFlow } from './flows/refresh.flow.js';
import { RegistrationFlow } from './flows/registration.flow.js';
import { SsoFlow } from './flows/sso.flow.js';
import { TotpFlow } from './flows/totp.flow.js';
import { ImpersonationFlow } from './flows/impersonation.flow.js';
import { AdminFlow } from './flows/admin.flow.js';
import { PasswordFlow } from './flows/password.flow.js';
import { EmailVerificationFlow } from './flows/email-verification.flow.js';
import { SessionsFlow } from './flows/sessions.flow.js';
import {
    OrgFlow,
} from './flows/org.flow.js';
import type { RegistrationPolicy } from './flows/apps.flow.js';
import {
    AppsFlow,
} from './flows/apps.flow.js';
import {
    M2MFlow,
} from './flows/m2m.flow.js';
import type { ModuleContext, ClientFlows } from './module-context.js';
import {
    AuthModule,
    AccountModule,
    SessionsModule,
    UsersModule,
    OrganizationsModule,
    AppsModule,
    ServicesModule,
    PoolsModule,
    AuditModule,
} from './modules/index.js';
import {
    NamespacesFlow,
} from './flows/namespaces.flow.js';
import { RefreshScheduler } from './refresh-scheduler.js';
import { IdleTracker } from './idle-tracker.js';
import { MagicLinkFlow } from './flows/magic-link.flow.js';
import { AuditLogFlow } from './flows/audit-log.flow.js';
import { OfflineModeError } from './errors.js';
import type {
    AuthClientConfig,
    AuthClientPorts,
    AuthEventHandler,
    AuthEventType,
    AuthResponse,
    AuthSnapshot,
    AuthStatus,
    BroadcastMessage,
    DecodedAccessToken,
    LogoutReason,
    MyOrgRecord,
    StoredTokens,
    TokenPair,
    TransportRequest,
    TransportResponse,
    User,
} from './types.js';
import { LocalStorageTokenStore } from './adapters/local-storage-token-store.js';
import { LocalStorageStorage } from './adapters/local-storage-storage.js';
import { FetchTransport } from './adapters/fetch-transport.js';
import { WebCryptoAdapter } from './adapters/web-crypto.js';
import { SystemClock } from './adapters/system-clock.js';
import { ConsoleLogger } from './adapters/loggers.js';
import {
    createDefaultBroadcast,
    NoOpBroadcast,
} from './adapters/broadcast-channel.js';

/** Default values for AuthClientConfig fields. Exposed so tests can
 * reference the same defaults the constructor uses. */
export const DEFAULTS = {
	storageNamespace: 'vendidit_auth',
    refreshLeewaySeconds: 60,
    attachAuthHeader: true,
    enableCrossTabSync: true,
    bootstrap: 'auto' as const,
    autoRetryOn401: true,
    autoRefresh: true,
} as const;

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
export class AuthClient {
    private readonly config: Required<Omit<AuthClientConfig, 'ports' | 'appCode'>> & {
        appCode?: string;
    };
    private readonly ports: AuthClientPorts;
    private readonly events: EventEmitter;
    private readonly refreshMutex = new RefreshMutex<TokenPair>();
    private readonly login: LoginFlow;
    private readonly logout: LogoutFlow;
    private readonly refresh: RefreshFlow;
    private readonly registration: RegistrationFlow;
    private readonly sso: SsoFlow;
    private readonly totp: TotpFlow;
    private readonly impersonation: ImpersonationFlow;
    private readonly admin: AdminFlow;
    private readonly password: PasswordFlow;
    private readonly emailVerification: EmailVerificationFlow;
    private readonly sessionsFlow: SessionsFlow;
    private readonly orgFlow: OrgFlow;
    private readonly appsFlow: AppsFlow;
    private readonly m2mFlow: M2MFlow;
    private readonly namespacesFlow: NamespacesFlow;
    private readonly magicLinkFlow: MagicLinkFlow;
    private readonly auditLogFlow: AuditLogFlow;
    private readonly unsubscribeCrossTab: () => void;
    private readonly refreshScheduler: RefreshScheduler | null;
    private readonly idleTracker: IdleTracker | null;
    private destroyed = false;
    /** Cached access-token claims — refreshed every time tokens change. */
    private cachedClaims: DecodedAccessToken | null = null;

    /* ------------------------------------------------------------------
     * Reactive state (for framework adapters)
     *
     * AuthClient is the single source of truth: status, ready flag, last
     * error, cached user. Adapters subscribe() for snapshots and project
     * into their framework-idiomatic primitive (useSyncExternalStore /
     * Solid signal / Vue ref / Vue watch / Svelte store).
     *
     * snapshot() returns a STABLE object reference: unchanged state →
     * same reference, so useSyncExternalStore's identity check avoids
     * spurious re-renders.
     * ------------------------------------------------------------------ */
    private currentStatus: AuthStatus = 'bootstrapping';
    private isReady_ = false;
    private lastError: Error | null = null;
    private currentSnapshot: AuthSnapshot;
    private readonly subscribers = new Set<(snap: AuthSnapshot) => void>();
    private readyResolve: ((value: AuthSnapshot) => void) | null = null;
    private readonly readyPromise: Promise<AuthSnapshot>;

    /* ------------------------------------------------------------------
     * Namespaced module API — THE SDK surface. Modules own the endpoint
     * implementations (flows + guard via ModuleContext); this core owns
     * config, ports, reactive snapshot, token storage and the session
     * engine. Session-mutating operations (login/logout/refresh/SSO
     * completion/…) are implemented below and surfaced through
     * client.auth / client.account — see module-context.ts for the
     * architecture diagram.
     *
     *   client.auth.login(...) · client.account.changePassword(...)
     *   client.sessions.list() · client.users.list(...)
     *   client.organizations.get(...) · client.apps.update(...)
     *   client.services.create(...) · client.pools.list()
     *   client.audit.list(...)
     * ------------------------------------------------------------------ */
    readonly auth: AuthModule;
    readonly account: AccountModule;
    readonly sessions: SessionsModule;
    readonly users: UsersModule;
    readonly organizations: OrganizationsModule;
    readonly apps: AppsModule;
    readonly services: ServicesModule;
    readonly pools: PoolsModule;
    readonly audit: AuditModule;

    constructor(config: AuthClientConfig) {
        if (!config.apiBaseUrl) {
            throw new Error('AuthClientConfig.apiBaseUrl is required');
        }
        // Normalize trailing slash so flow code can safely concatenate.
        const apiBaseUrl = config.apiBaseUrl.replace(/\/+$/, '');
        const namespace = config.storageNamespace ?? DEFAULTS.storageNamespace;
        this.config = {
            apiBaseUrl,
            storageNamespace: namespace,
            refreshLeewaySeconds: config.refreshLeewaySeconds ?? DEFAULTS.refreshLeewaySeconds,
            attachAuthHeader: config.attachAuthHeader ?? DEFAULTS.attachAuthHeader,
            enableCrossTabSync: config.enableCrossTabSync ?? DEFAULTS.enableCrossTabSync,
            bootstrap: config.bootstrap ?? DEFAULTS.bootstrap,
            autoRetryOn401: config.autoRetryOn401 ?? DEFAULTS.autoRetryOn401,
            autoRefresh: config.autoRefresh ?? DEFAULTS.autoRefresh,
            idleTimeoutMs: config.idleTimeoutMs ?? 0,
        };
        if (config.appCode !== undefined) {
            this.config.appCode = config.appCode;
        }

        // Initial snapshot — placeholder for the first emit. Status is
        // 'offline' when configured offline, otherwise 'bootstrapping'
        // until the auto-bootstrap finishes. The readyPromise is the
        // adapter's "okay to render" signal.
        this.currentSnapshot = {
            status: this.config.bootstrap === 'offline' ? 'offline' : 'bootstrapping',
            ready: this.config.bootstrap === 'offline',
            user: null,
            claims: null,
            isImpersonating: false,
            error: null,
        };
        this.currentStatus = this.currentSnapshot.status;
        this.isReady_ = this.currentSnapshot.ready;
        this.readyPromise = new Promise<AuthSnapshot>((resolve) => {
            this.readyResolve = resolve;
        });

        // Compose ports: caller-supplied overrides win; otherwise instantiate
        // the browser defaults.
        const overrides = config.ports ?? {};
        const logger = overrides.logger ?? new ConsoleLogger('info');
        const tokenStore = overrides.tokenStore ?? new LocalStorageTokenStore(namespace);
        const transport =
            overrides.transport ??
            new FetchTransport({
                tokenProvider: () => this.getAccessTokenForTransport(),
                attachAuthHeader: this.config.attachAuthHeader,
            });
        this.ports = {
            tokenStore,
            transport,
            storage: overrides.storage ?? new LocalStorageStorage(namespace),
            clock: overrides.clock ?? new SystemClock(),
            crypto: overrides.crypto ?? new WebCryptoAdapter(),
            logger,
            broadcast:
                overrides.broadcast ??
                (this.config.enableCrossTabSync ? createDefaultBroadcast() : new NoOpBroadcast()),
        };

        this.events = new EventEmitter(this.ports.logger);

        const flowDeps = {
            apiBaseUrl: this.config.apiBaseUrl,
            ports: this.ports,
            appCode: this.config.appCode,
        };
        this.login = new LoginFlow(flowDeps);
        this.logout = new LogoutFlow(flowDeps);
        this.refresh = new RefreshFlow(flowDeps);
        this.registration = new RegistrationFlow(flowDeps);
        this.sso = new SsoFlow(flowDeps);
        this.totp = new TotpFlow(flowDeps);
        this.impersonation = new ImpersonationFlow(flowDeps);
        this.admin = new AdminFlow(flowDeps);
        this.password = new PasswordFlow(flowDeps);
        this.emailVerification = new EmailVerificationFlow(flowDeps);
        this.sessionsFlow = new SessionsFlow(flowDeps);
        this.orgFlow = new OrgFlow(flowDeps);
        this.appsFlow = new AppsFlow(flowDeps);
        this.m2mFlow = new M2MFlow(flowDeps);
        this.namespacesFlow = new NamespacesFlow(flowDeps);

        this.magicLinkFlow = new MagicLinkFlow(flowDeps);
        this.auditLogFlow = new AuditLogFlow(flowDeps);

        // Namespaced module API. Each module receives ONE shared context:
        // the flow instances (endpoint I/O), the offline guard, and the
        // core session-engine primitives (this client). Modules own the
        // endpoint implementations; this core owns session state.
        const flows: ClientFlows = {
            login: this.login,
            logout: this.logout,
            refresh: this.refresh,
            registration: this.registration,
            sso: this.sso,
            totp: this.totp,
            impersonation: this.impersonation,
            admin: this.admin,
            password: this.password,
            emailVerification: this.emailVerification,
            sessions: this.sessionsFlow,
            org: this.orgFlow,
            apps: this.appsFlow,
            m2m: this.m2mFlow,
            namespaces: this.namespacesFlow,
            magicLink: this.magicLinkFlow,
            auditLog: this.auditLogFlow,
        };
        const ctx: ModuleContext = {
            flows,
            guard: (operation: string) => this.assertOnline(operation),
            core: this,
        };
        this.auth = new AuthModule(ctx);
        this.account = new AccountModule(ctx);
        this.sessions = new SessionsModule(ctx);
        this.users = new UsersModule(ctx);
        this.organizations = new OrganizationsModule(ctx);
        this.apps = new AppsModule(ctx);
        this.services = new ServicesModule(ctx);
        this.pools = new PoolsModule(ctx);
        this.audit = new AuditModule(ctx);

        // Background refresh — re-mint the access token shortly before
        // exp so an actively-used app never blinks to 'anonymous'.
        // Gated on config.autoRefresh (default true). Scheduled lazily
        // after the first persistTokens(); cancel happens on logout/destroy.
        this.refreshScheduler = this.config.autoRefresh
            ? new RefreshScheduler(this.ports.clock, {
                leewaySeconds: this.config.refreshLeewaySeconds,
            })
            : null;

        // Optional client-side idle policy. When idleTimeoutMs is set,
        // the tracker watches DOM activity events and clears local
        // state after the threshold — refresh token stays valid
        // server-side but the user must sign in again locally.
        this.idleTracker = this.config.idleTimeoutMs > 0
            ? new IdleTracker({
                idleTimeoutMs: this.config.idleTimeoutMs,
                onIdle: () => { void this.handleIdleTimeout(); },
            })
            : null;

        // Cross-tab subscription — listen for "another tab logged in / out"
        // and mirror that state here so this tab doesn't keep operating
        // with stale tokens.
        this.unsubscribeCrossTab = this.ports.broadcast.subscribe((m) => {
            this.handleCrossTabMessage(m);
        });

        // Kick off bootstrap. The strategy lives entirely inside
        // runBootstrap() — the constructor returns synchronously while
        // ready() resolves once the (possibly async) check completes.
        void this.runBootstrap();
    }

    /* ------------------------------------------------------------------
     * Bootstrap
     *
     * Three modes (see AuthClientConfig.bootstrap):
     *   - 'auto': read cached tokens, refresh if near-expiry, validate
     *     via /auth/me. Resolves ready() when done.
     *   - 'lazy': set status from cached claims only, no network. First
     *     failed request triggers refresh / clear.
     *   - 'offline': mark status='offline', ready=true immediately. All
     *     flow methods throw OfflineModeError.
     * ------------------------------------------------------------------ */
    private async runBootstrap(): Promise<void> {
        if (this.config.bootstrap === 'offline') {
            // Status was already set in the constructor; just resolve
            // ready() so adapters un-block.
            this.finishBootstrap();
            return;
        }

        // Restore claims from any stored token first — gives the
        // adapter something to render while we run the server check.
        await this.refreshCachedClaims();
        const hasValidClaims =
            this.cachedClaims !== null && !this.isExpired(this.cachedClaims);

        if (this.config.bootstrap === 'lazy') {
            // Trust the cache. Terminal status: 'authenticated' if we
            // have valid-looking claims, 'anonymous' otherwise. The
            // first request that fails 401 will trigger refresh/clear
            // via the autoRetryOn401 path.
            this.transitionTo(hasValidClaims ? 'authenticated' : 'anonymous');
            this.finishBootstrap();
            return;
        }

        // 'auto' mode: actively validate.
        try {
            const stored = await this.ports.tokenStore.get();
            if (!stored) {
                this.transitionTo('anonymous');
                this.finishBootstrap();
                return;
            }
            // Preemptively refresh when within the leeway window.
            const now = this.ports.clock.nowSeconds();
            if (stored.expires_at_seconds - this.config.refreshLeewaySeconds <= now) {
                await this.refreshAccessToken();
                // refreshAccessToken → persistTokens already armed
                // the scheduler against the new exp.
            } else {
                // Token still has plenty of life; arm the scheduler
                // against the current persisted exp so the timer
                // starts running for the existing session (the
                // persistTokens path that normally arms it doesn't
                // fire when the token was already valid at boot).
                this.refreshScheduler?.schedule(stored.expires_at_seconds, () => {
                    void this.handleScheduledRefresh();
                });
            }
            // Start the idle tracker once we know the session is valid.
            this.idleTracker?.start();
            // Confirm with the server. /auth/me's 200 = the session is
            // still valid; 401 = revoked / hard-deleted / token-version
            // bumped on us → clear locally.
            await this.whoami();
            this.transitionTo('authenticated');
        } catch (err) {
            this.ports.logger.info('bootstrap validation failed; clearing local state', {
                error: err instanceof Error ? err.message : String(err),
            });
            await this.ports.tokenStore.clear();
            this.cachedClaims = null;
            this.transitionTo('anonymous');
        } finally {
            this.finishBootstrap();
        }
    }

    private finishBootstrap(): void {
        this.isReady_ = true;
        this.emitSnapshot();
        if (this.readyResolve) {
            this.readyResolve(this.currentSnapshot);
            this.readyResolve = null;
        }
    }

    /* ------------------------------------------------------------------
     * Public API — reactive surface
     *
     * subscribe() + getSnapshot() + ready() form the integration point
     * for framework adapters. The shapes intentionally match React's
     * useSyncExternalStore contract so a React/Preact adapter is a
     * one-liner — Solid/Vue/Svelte translate trivially via a derived
     * primitive.
     * ------------------------------------------------------------------ */

    /** Snapshot of the current reactive state. Reference-stable: the
     * same object is returned until something changes. Adapters use
     * this with useSyncExternalStore / createMemo / computed. */
    getSnapshot(): AuthSnapshot {
        return this.currentSnapshot;
    }

    /** Subscribe to snapshot changes. Returns the unsubscribe function.
     * Adapters typically register one subscriber per component instance
     * via their framework's effect primitive. */
    subscribe(listener: (snapshot: AuthSnapshot) => void): () => void {
        this.subscribers.add(listener);
        return () => {
            this.subscribers.delete(listener);
        };
    }

    /** Resolves with the current snapshot once bootstrap completes. UIs
     * gate their first authenticated render on this — a splash screen
     * shows while ready() is pending. */
    ready(): Promise<AuthSnapshot> {
        return this.readyPromise;
    }

    /** True once bootstrap (auto / lazy / offline) has finished. */
    isReady(): boolean {
        return this.isReady_;
    }

    /** Current lifecycle status. Equivalent to getSnapshot().status. */
    getStatus(): AuthStatus {
        return this.currentStatus;
    }

    /** True when the client is configured offline. All flow methods
     * throw OfflineModeError; read-state methods return null/false. */
    isOfflineMode(): boolean {
        return this.config.bootstrap === 'offline';
    }

    /* ------------------------------------------------------------------
     * Public API — events
     * ------------------------------------------------------------------ */

    /** Subscribe to an event. Returns the unsubscribe function. */
    on<T extends AuthEventType>(type: T, handler: AuthEventHandler<T>): () => void {
        return this.events.on(type, handler);
    }

    /** Manual unsubscribe — usually use the return of on() instead. */
    off<T extends AuthEventType>(type: T, handler: AuthEventHandler<T>): void {
        this.events.off(type, handler);
    }

    /** Are we currently authenticated? Synchronous; reflects cached state.
     * In offline mode this is always false. */
    isAuthenticated(): boolean {
        if (this.isOfflineMode()) return false;
        return this.cachedClaims !== null && !this.isExpired(this.cachedClaims);
    }

    /** Current access token, if any. Returns null when logged out. The
     * Transport already attaches this automatically; consumers calling
     * other HTTP clients (axios, etc.) can use this to attach manually. */
    async getAccessToken(): Promise<string | null> {
        const stored = await this.ports.tokenStore.get();
        if (!stored) return null;
        // If expired and we have a refresh token, refresh first.
        const now = this.ports.clock.nowSeconds();
        if (stored.expires_at_seconds - this.config.refreshLeewaySeconds <= now) {
            try {
                await this.refreshAccessToken();
                const fresh = await this.ports.tokenStore.get();
                return fresh?.access_token ?? null;
            } catch {
                return null;
            }
        }
        return stored.access_token;
    }

    /** Decoded claims of the current access token. Null when logged out
     * or token is malformed. Synchronous — reads the cached value. */
    getDecodedClaims(): DecodedAccessToken | null {
        return this.cachedClaims;
    }

    /** Convenience: current user as a User object, reconstructed from the
     * decoded token. For a server-authoritative snapshot, call
     * whoami() — it hits /auth/me. */
    getCurrentUser(): { id: string; email: string } | null {
        const claims = this.cachedClaims;
        if (!claims) return null;
        return { id: claims.uid, email: claims.email };
    }

    /** True if the current session is an impersonation (AUDIT C7). UIs
     * can use this to render an "Acting as X" banner. */
    isImpersonating(): boolean {
        return this.cachedClaims?.imp_uid !== undefined;
    }

    /** Password login. On success, persists tokens + emits "authenticated".
     * On 2FA challenge, returns {requires_2fa: true} without throwing.
     * On hard failure (bad password, locked account, etc.), throws. */
    async loginWithPassword(params: LoginParams): Promise<AuthResponse> {
        this.assertOnline('loginWithPassword');
        const result = await this.login.execute({
            email: params.email,
            password: params.password,
            organization_id: params.organizationId,
            remember_me: params.rememberMe,
            two_factor_code: params.twoFactorCode,
            app_code: this.config.appCode,
        });
        if (result.requires_2fa) {
            this.events.emit({ type: 'requires_two_factor', email: params.email });
            return result;
        }
        await this.persistAndAnnounce(result);
        return result;
    }



    /** Complete an SSO sign-in. Pass the `code` + `state` the provider
     * redirected back with. The SDK exchanges with the auth-server,
     * handles the PKCE auth_code redemption automatically, and emits
     * "authenticated" on success. */
    async completeSso(params: { code: string; state: string; provider?: string }): Promise<AuthResponse> {
        this.assertOnline('completeSso');
        const result = await this.sso.complete(params);
        await this.persistAndAnnounce(result);
        return result;
    }

    /** Register a new user. The mode field on the server lets registration
     * also act as login when the email is already known (see auth-server
     * RegistrationMode); the SDK exposes this via the explicit
     * register_or_login parameter. */
    async register(params: RegisterParams): Promise<AuthResponse> {
        this.assertOnline('register');
        const result = await this.registration.register({
            email: params.email,
            password: params.password,
            first_name: params.firstName,
            last_name: params.lastName,
            organization_id: params.organizationId,
            organization_name: params.organizationName,
            invite_code: params.inviteCode,
            invite_token: params.inviteToken,
            app_code: params.appCode ?? this.config.appCode,
        });
        // Server may or may not return tokens depending on the registration
        // mode. If it did, persist them; otherwise leave logged-out.
        if (result.tokens && result.user) {
            await this.persistAndAnnounce(result);
        }
        return result;
    }

    /** Logout the current session — revokes the refresh token server-side,
     * clears local state, emits "logged_out". */
    async logoutCurrent(): Promise<void> {
        const stored = await this.ports.tokenStore.get();
        if (stored) {
            try {
                await this.logout.execute({ refresh_token: stored.refresh_token });
            } catch (err) {
                // Logout failures are non-fatal — clear local state
                // anyway. Log the underlying failure for observability.
                this.ports.logger.warn('logout request failed; clearing locally', {
                    error: err instanceof Error ? err.message : String(err),
                });
            }
        }
        await this.clearAndAnnounce('user_initiated');
    }

    /** Revoke every refresh token for the current user AND bump the
     * server's per-user token-version so any outstanding access token
     * is immediately invalid cross-replica. AUDIT 1.10. */
    async logoutAll(): Promise<void> {
        try {
            await this.logout.executeAll();
        } catch (err) {
            this.ports.logger.warn('logout-all request failed; clearing locally', {
                error: err instanceof Error ? err.message : String(err),
            });
        }
        await this.clearAndAnnounce('user_initiated');
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
    async refreshAccessToken(context?: { organizationId?: string; appCode?: string }): Promise<TokenPair> {
        this.assertOnline('refreshAccessToken');
        return this.refreshMutex.run(async () => {
            const stored = await this.ports.tokenStore.get();
            if (!stored) {
                throw new Error('not authenticated');
            }
            const result = await this.refresh.execute({
                refresh_token: stored.refresh_token,
                ...(context?.organizationId !== undefined && { organization_id: context.organizationId }),
                ...(context?.appCode !== undefined && { app_code: context.appCode }),
            });
            if (!result.tokens) {
                throw new Error('refresh did not return tokens');
            }
            await this.persistTokens(result.tokens);
            this.events.emit({ type: 'token_refreshed', tokens: result.tokens });
            this.ports.broadcast.publish({
                type: 'token_refreshed',
                user_id: this.cachedClaims?.uid,
            });
            return result.tokens;
        });
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
        this.assertOnline('switchOrg');
        const tokens = await this.refreshAccessToken({ organizationId });
        this.events.emit({ type: 'org_switched', organizationId, tokens });
        return tokens;
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
        this.assertOnline('whoami');
        const resp = await this.authenticatedRequest<Record<string, any>>({
            method: 'GET',
            url: `${this.config.apiBaseUrl}/auth/me`,
        });
        if (!resp.ok) {
            throw await responseError(resp);
        }
        const body = resp.body ?? {};
        // Accept both shapes: legacy `{ user: { … } }` AND the current
        // flat shape. If `body.user` exists treat it as authoritative;
        // otherwise pluck the fields from the top level.
        const src = (body.user && typeof body.user === 'object') ? body.user : body;
        return {
            id: src.id ?? src.user_id ?? '',
            email: src.email ?? '',
            first_name: src.first_name,
            last_name: src.last_name,
            display_name: src.display_name,
            status: src.status,
            email_verified: src.email_verified,
            two_factor_enabled: src.two_factor_enabled,
            auth_provider: src.auth_provider,
            created_at: src.created_at,
            updated_at: src.updated_at,
            last_login_at: src.last_login_at,
        } as User;
    }

    /**
     * GET /me/orgs — the authenticated user's organization memberships.
     * Self-service mirror of getMyApps() / /me/apps. Lets UIs render an
     * org-switcher without admin scope (AUTH-PHP-LARAVEL-DESIGN §5).
     *
     * Returns the raw `organizations` array; consumers map it to their
     * own UI shape. The response shape matches the admin variant so a
     * shared renderer can take either source.
     */
    async getMyOrgs(): Promise<MyOrgRecord[]> {
        this.assertOnline('getMyOrgs');
        const resp = await this.authenticatedRequest<{ organizations: MyOrgRecord[] }>({
            method: 'GET',
            url: `${this.config.apiBaseUrl}/me/orgs`,
        });
        if (!resp.ok) {
            throw await responseError(resp);
        }
        return resp.body.organizations ?? [];
    }

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
    async authenticatedRequest<T = unknown>(req: TransportRequest): Promise<TransportResponse<T>> {
        if (this.isOfflineMode()) {
            throw new OfflineModeError('authenticatedRequest');
        }
        const initial = await this.ports.transport.request<T>(req);
        if (initial.status !== 401 || !this.config.autoRetryOn401) {
            return initial;
        }
        // Avoid infinite retry on the refresh endpoint itself.
        if (req.url.endsWith('/auth/refresh') || req.url.endsWith('/auth/logout')) {
            return initial;
        }
        try {
            await this.refreshAccessToken();
        } catch {
            // Refresh failed: the refresh token itself is dead. Clear
            // local state and emit session_expired so adapters can
            // route to /login.
            await this.clearAndAnnounce('session_expired');
            this.events.emit({ type: 'session_expired' });
            return initial;
        }
        return this.ports.transport.request<T>(req);
    }

    /* ------------------------------------------------------------------
     * 2FA disable (session-coupled — bumps token-version; setup/enable live in client.account)
     * ------------------------------------------------------------------ */



    /** Turn 2FA off — requires the current password + a fresh code. */
    async disableTwoFactor(params: { password: string; code: string }): Promise<void> {
        this.assertOnline('disableTwoFactor');
        await this.totp.disable(params);
        // Disabling 2FA bumps the server's token-version, so our current
        // access token will fail on next use. Preempt by refreshing.
        await this.refreshAccessToken().catch(() => {
            // If the refresh itself fails, clear locally — the user has
            // to re-login. This is the right shape: 2FA-off is a security
            // event and forcing a re-login is acceptable.
            void this.clearAndAnnounce('token_revoked');
        });
    }

    /* ------------------------------------------------------------------
     * Impersonation + destructive account ops (session-coupled)
     * ------------------------------------------------------------------ */

    /** Impersonate another user (AUDIT C7). The caller's token must carry
     * a role authorized for impersonation (system_admin / super_admin
     * anywhere, org_admin within their org). On success, the SDK swaps
     * in the new token pair so subsequent requests act as the target. */
    async impersonate(params: ImpersonateParams): Promise<AuthResponse> {
        this.assertOnline('impersonate');
        const result = await this.impersonation.execute({
            userId: params.targetUserId,
            reason: params.reason,
        });
        await this.persistAndAnnounce(result);
        return result;
    }




































    /* ------------------------------------------------------------------
     * Organization administration
     *
     * Convenience facade over OrgFlow. Each method is a one-liner that
     * forwards to the flow — present here so consumers don't need to
     * reach into `client.orgFlow.…`. Group ownership: settings, members,
     * custom roles, invitations.
     * ------------------------------------------------------------------ */





































    /* ── Invitations ──────────────────────────────────────────────── */













    /* ------------------------------------------------------------------
     * App registration policy
     * ------------------------------------------------------------------ */

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
    async getSsoProviders(): Promise<string[]> {
        return this.sso.getEnabledProviders();
    }

    async getRegistrationPolicy(appCode?: string): Promise<RegistrationPolicy> {
        this.assertOnline('getRegistrationPolicy');
        const code = appCode ?? this.config.appCode;
        if (!code) {
            throw new Error(
                'getRegistrationPolicy requires an app code: pass one explicitly or set AuthClientConfig.appCode',
            );
        }
        return this.appsFlow.getRegistrationPolicy(code);
    }













































    /* ------------------------------------------------------------------
     * Magic-link sign-in
     * ------------------------------------------------------------------ */

    /**
     * Request a magic-link email. Anonymous flow; server is silent on
     * whether the email is registered.
     *
     * `appCode` defaults to the AuthClient's configured app code so the
     * resulting token-pair scopes correctly. Pass an explicit code to
     * override.
     */
    async requestMagicLink(email: string, appCode?: string): Promise<void> {
        this.assertOnline('requestMagicLink');
        await this.magicLinkFlow.request({
            email,
            ...((appCode ?? this.config.appCode) && { appCode: appCode ?? this.config.appCode }),
        });
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
        this.assertOnline('verifyMagicLink');
        const resp = await this.magicLinkFlow.verify({ token });
        if (resp.tokens) {
            // Same plumbing as loginWithPassword: persist + emit
            // `authenticated` so subscribers (and the snapshot) react.
            await this.persistTokens(resp.tokens);
            if (resp.user) {
                this.events.emit({
                    type: 'authenticated',
                    user: resp.user,
                    tokens: resp.tokens,
                });
            }
        }
        return resp;
    }




    /* ------------------------------------------------------------------
     * Self-service account deletion
     * ------------------------------------------------------------------ */

    /**
     * Delete the caller's own account. Calls DELETE /me/account with
     * the user's current password + a typed "DELETE" confirmation
     * (the server enforces both — we don't try to be clever here).
     * On success, the AuthClient's snapshot transitions to anonymous
     * (the access token's tv claim is bumped server-side, refresh row
     * was cascade-deleted with the user row).
     */
    async deleteMyAccount(currentPassword: string): Promise<void> {
        this.assertOnline('deleteMyAccount');
        const resp = await this.ports.transport.request({
            method: 'DELETE',
            url: `${this.config.apiBaseUrl}/me/account`,
            body: { password: currentPassword, confirmation: 'DELETE' },
        });
        if (!resp.ok) {
            throw await responseError(resp);
        }
        // Clear local state. We use the same path session-expired takes
        // since the result is the same: token-pair gone, snapshot
        // anonymous.
        await this.clearAndAnnounce('user_initiated');
    }

    /* ------------------------------------------------------------------
     * Lifecycle
     * ------------------------------------------------------------------ */

    /** Tear down — unsubscribes from cross-tab, clears event listeners.
     * Called by the host app on unmount; subsequent calls are no-ops. */
    destroy(): void {
        if (this.destroyed) return;
        this.destroyed = true;
        this.refreshScheduler?.cancel();
        this.idleTracker?.stop();
        this.unsubscribeCrossTab();
        this.ports.broadcast.close();
        this.events.clear();
    }

    /* ------------------------------------------------------------------
     * Internal helpers
     * ------------------------------------------------------------------ */

    private async persistAndAnnounce(result: AuthResponse): Promise<void> {
        if (!result.tokens || !result.user) return;
        await this.persistTokens(result.tokens);
        this.transitionTo('authenticated');
        this.events.emit({
            type: 'authenticated',
            user: result.user,
            tokens: result.tokens,
        });
        this.ports.broadcast.publish({
            type: 'authenticated',
            user_id: result.user.id,
        });
    }

    /**
     * Refuse a flow call when the client is offline. Read-state methods
     * (isAuthenticated, getCurrentUser) silently return null/false; only
     * methods that would otherwise issue a network request throw, so the
     * "I forgot to set bootstrap to online" failure is loud.
     */
    private assertOnline(operation: string): void {
        if (this.isOfflineMode()) {
            throw new OfflineModeError(operation);
        }
    }

    /**
     * Move to a new lifecycle status + rebuild the snapshot. No-op when
     * the status didn't change and ready hasn't flipped.
     */
    private transitionTo(status: AuthStatus): void {
        if (status === this.currentStatus) {
            // Status unchanged but the snapshot may still need a rebuild
            // (e.g., cachedClaims updated). Rely on emitSnapshot's
            // identity check.
            this.emitSnapshot();
            return;
        }
        this.currentStatus = status;
        this.emitSnapshot();
        this.events.emit({
            type: 'status_changed',
            status,
            snapshot: this.currentSnapshot,
        });
    }

    /**
     * Recompute status from cached claims. Called after a refresh, a
     * cross-tab sync, or a logout. {initial: true} suppresses the
     * status_changed event emission for the constructor-time recompute
     * (we'll emit once when bootstrap finalizes).
     */
    private recomputeStatus(opts: { initial?: boolean } = {}): void {
        let status: AuthStatus;
        if (this.isOfflineMode()) {
            status = 'offline';
        } else if (this.cachedClaims && !this.isExpired(this.cachedClaims)) {
            status = 'authenticated';
        } else if (!this.isReady_) {
            status = 'bootstrapping';
        } else {
            status = 'anonymous';
        }
        if (opts.initial) {
            this.currentStatus = status;
            this.emitSnapshot();
        } else {
            this.transitionTo(status);
        }
    }

    /**
     * Build a fresh snapshot from the current state, store it, and
     * notify subscribers if the value changed. Reference-stable when
     * inputs are unchanged.
     */
    private emitSnapshot(): void {
        const snap: AuthSnapshot = {
            status: this.currentStatus,
            ready: this.isReady_,
            user: this.cachedClaims
                ? { id: this.cachedClaims.uid, email: this.cachedClaims.email }
                : null,
            claims: this.cachedClaims,
            isImpersonating: this.cachedClaims?.imp_uid !== undefined,
            error: this.lastError,
        };
        if (snapshotsEqual(this.currentSnapshot, snap)) {
            return;
        }
        this.currentSnapshot = snap;
        for (const listener of Array.from(this.subscribers)) {
            try {
                listener(snap);
            } catch (err) {
                this.ports.logger.warn('snapshot subscriber threw', {
                    error: err instanceof Error ? err.message : String(err),
                });
            }
        }
    }

    private async persistTokens(tokens: TokenPair): Promise<void> {
        const stored: StoredTokens = {
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
            // Wire format gives us "expires_in" (seconds) AND "expires_at"
            // (RFC3339 string). We persist expires_at_seconds so the
            // refresh-leeway check is a single integer comparison.
            expires_at_seconds: this.parseExpiresAt(tokens),
        };
        await this.ports.tokenStore.set(stored);
        await this.refreshCachedClaims();
        // Re-anchor the background refresh on the new exp. Done after
        // store + claims write so the scheduled refresh runs against
        // an up-to-date persisted token. Also (re-)start the idle
        // tracker on first successful persist — instantiated lazily so
        // SSR builds that never log in don't attach DOM listeners.
        this.refreshScheduler?.schedule(stored.expires_at_seconds, () => {
            void this.handleScheduledRefresh();
        });
        this.idleTracker?.start();
    }

    /**
     * Background refresh tick. Called from the RefreshScheduler's
     * setTimeout. Guards: skip if no token (logged out between schedule
     * and fire), skip if the idle tracker says we're idle (let the
     * token expire naturally; onIdle will clear state). Swallows
     * errors — we let the autoRetryOn401 path handle the next request
     * if this fails.
     */
    private async handleScheduledRefresh(): Promise<void> {
        if (this.destroyed) return;
        const stored = await this.ports.tokenStore.get();
        if (!stored) return;
        if (this.idleTracker?.isIdle()) return;
        try {
            await this.refreshAccessToken();
        } catch (err) {
            this.ports.logger.info('background refresh failed', {
                error: err instanceof Error ? err.message : String(err),
            });
            // Don't tear down here. The next request may succeed via
            // the autoRetryOn401 path, or fail loudly and trigger
            // clearLocalState. Background refresh is best-effort.
        }
    }

    /**
     * Idle-timeout handler. Best-effort local sign-out: clear stored
     * tokens, drop cached claims, flip to 'anonymous'. The refresh
     * token stays valid server-side until its natural exp — the user
     * just has to sign in again to use this device. Compare to
     * `logoutCurrent()` which also notifies the server.
     */
    private async handleIdleTimeout(): Promise<void> {
        if (this.destroyed) return;
        this.ports.logger.info('idle timeout — clearing local auth state');
        this.refreshScheduler?.cancel();
        await this.ports.tokenStore.clear();
        this.cachedClaims = null;
        this.transitionTo('anonymous');
        this.events.emit({ type: 'logged_out', reason: 'idle_timeout' });
    }

    private parseExpiresAt(tokens: TokenPair): number {
        // Prefer the absolute timestamp when it parses; otherwise fall
        // back to clock + expires_in. The two should agree, but in case
        // of clock skew we trust the server's absolute value.
        const parsed = Date.parse(tokens.expires_at);
        if (!Number.isNaN(parsed)) {
            return Math.floor(parsed / 1000);
        }
        return this.ports.clock.nowSeconds() + tokens.expires_in;
    }

    private async refreshCachedClaims(): Promise<void> {
        const stored = await this.ports.tokenStore.get();
        const before = this.cachedClaims;
        if (!stored) {
            this.cachedClaims = null;
        } else {
            this.cachedClaims = tryDecodeAccessToken(stored.access_token);
        }
        // If we're past boot, mirror status changes promptly. During
        // boot, runBootstrap handles status transitions explicitly.
        if (this.isReady_ && before !== this.cachedClaims) {
            this.recomputeStatus();
        } else if (this.isReady_) {
            // Same claim ref but emit a snapshot in case derived fields
            // changed downstream (e.g., impersonation stamp).
            this.emitSnapshot();
        }
    }

    private async getAccessTokenForTransport(): Promise<string | null> {
        // Read the stored value directly — DO NOT call getAccessToken()
        // here, which would recursively trigger refresh. The transport
        // attaches the token as-is; the higher-level public method does
        // the preemptive refresh.
        const stored = await this.ports.tokenStore.get();
        return stored?.access_token ?? null;
    }

    private isExpired(claims: DecodedAccessToken): boolean {
        return claims.exp <= this.ports.clock.nowSeconds();
    }

    private async clearAndAnnounce(reason: LogoutReason): Promise<void> {
        // Stop the background refresh + idle tracker before clearing —
        // otherwise the scheduler could fire one more refresh against
        // the about-to-be-cleared tokens.
        this.refreshScheduler?.cancel();
        this.idleTracker?.stop();
        await this.ports.tokenStore.clear();
        this.cachedClaims = null;
        this.transitionTo('anonymous');
        this.events.emit({ type: 'logged_out', reason });
        this.ports.broadcast.publish({ type: 'logged_out' });
    }

    /** Handle a cross-tab broadcast message. The sending tab already
     * updated its own state + persisted tokens to localStorage; we just
     * mirror by reloading from the store and emitting matching events. */
    private handleCrossTabMessage(message: BroadcastMessage): void {
        switch (message.type) {
            case 'authenticated':
            case 'token_refreshed':
                // Reload cached claims; another tab wrote new tokens to
                // the shared localStorage. We don't emit a duplicate
                // "authenticated" event — that would surprise consumers
                // who expect it as a response to THEIR login call. The
                // cross-tab consumer can subscribe to the broadcast
                // channel directly if they want explicit cross-tab
                // notifications.
                this.refreshCachedClaims().catch((err) => {
                    this.ports.logger.warn('failed to mirror cross-tab auth', {
                        error: err instanceof Error ? err.message : String(err),
                    });
                });
                break;
            case 'logged_out':
                // Another tab logged out — drop our local state too.
                void this.ports.tokenStore.clear().then(() => {
                    this.cachedClaims = null;
                    this.events.emit({ type: 'logged_out', reason: 'cross_tab_sync' });
                });
                break;
        }
    }
}

/** Convenience factory — equivalent to `new AuthClient(config)` but reads
 * idiomatically in app boot code. */
export function createAuthClient(config: AuthClientConfig): AuthClient {
    return new AuthClient(config);
}

async function responseError(resp: {
    status: number;
    body: unknown;
}): Promise<Error> {
    const { fromHttpResponse } = await import('./errors.js');
    return fromHttpResponse(resp.status, resp.body);
}

/**
 * Field-by-field equality. We avoid JSON.stringify because the claims
 * object identity already tells us if anything inside changed (same
 * reference → same content; refreshCachedClaims allocates a new object
 * on any real update).
 */
function snapshotsEqual(a: AuthSnapshot, b: AuthSnapshot): boolean {
    if (a === b) return true;
    return (
        a.status === b.status &&
        a.ready === b.ready &&
        a.isImpersonating === b.isImpersonating &&
        a.error === b.error &&
        a.claims === b.claims &&
        (a.user === b.user ||
            (a.user !== null &&
                b.user !== null &&
                a.user.id === b.user.id &&
                a.user.email === b.user.email))
    );
}
