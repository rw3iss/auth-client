/**
 * @rw3iss/auth-client — public API barrel.
 *
 * Everything a consumer needs to integrate the SDK lives here. The
 * /core/* tree contains the implementation; framework adapters live
 * under /framework-adapters/.
 *
 * Typical consumer usage:
 *
 * ```ts
 * import { createAuthClient } from '@rw3iss/auth-client';
 * const auth = createAuthClient({
 *   apiBaseUrl: 'https://auth.ryanweiss.net/api/v1',
 *   appCode: 'marketplace-buyer',
 * });
 *
 * const result = await auth.auth.login({ email, password });
 * if (result.requires_2fa) {
 *   const code = await promptUserForTotp();
 *   await auth.auth.login({ email, password, twoFactorCode: code });
 * }
 *
 * const off = auth.on('logged_out', () => router.push('/login'));
 * ```
 *
 * Advanced customization — swap ports:
 *
 * ```ts
 * import { createAuthClient, MemoryTokenStore } from '@rw3iss/auth-client';
 * const auth = createAuthClient({
 *   apiBaseUrl: '...',
 *   ports: { tokenStore: new MemoryTokenStore() },  // SSR-safe
 * });
 * ```
 */

// Facade + factory
export { AuthClient, createAuthClient, DEFAULTS } from './core/auth-client.js';
export type {
    LoginParams,
    SsoStartParams,
    SsoStartResult,
    RegisterParams,
    ImpersonateParams,
} from './core/auth-client.js';

// Core types
export type {
    AuthClientConfig,
    AuthClientPorts,
    AuthEvent,
    AuthEventHandler,
    AuthEventType,
    AuthResponse,
    AuthSnapshot,
    AuthStatus,
    Broadcast,
    BroadcastMessage,
    Clock,
    Crypto,
    DecodedAccessToken,
    Logger,
    LogoutReason,
    MyOrgRecord,
    Organization,
    Storage,
    StoredTokens,
    TokenPair,
    TokenStore,
    Transport,
    TransportRequest,
    TransportResponse,
    User,
} from './core/types.js';

// Errors
export {
    AuthError,
    ConflictError,
    ForbiddenError,
    fromHttpResponse,
    NetworkError,
    NotFoundError,
    OfflineModeError,
    RateLimitedError,
    RequiresTwoFactorError,
    ServerError,
    UnauthenticatedError,
    ValidationError,
} from './core/errors.js';

// Auth-shared re-exports — single import point for consumers that
// want the canonical wire shapes + principals without depending on
// `@rw3iss/auth-shared` directly. The contract is the same; this
// is just import-path ergonomics for SDK / app consumers that already
// pull in `@rw3iss/auth-client`.
export type {
    AuthenticatedUser,
    ServicePrincipal,
    AuthPrincipal,
    JwtPayload as JwtPayloadUnion,
    UserJwtPayload,
    RefreshJwtPayload,
    ServiceJwtPayload,
    BaseJwtClaims,
    ImpersonationClaims,
    PasswordResetClaims,
    EmailVerificationClaims,
    AccessJwtPayload,
} from '@rw3iss/auth-shared/jwt';

// Adapters — exported so consumers can mix-and-match (e.g. wrap
// FetchTransport with retry, or use MemoryTokenStore for SSR).
export { LocalStorageTokenStore, MemoryTokenStore } from './core/adapters/local-storage-token-store.js';
export { LocalStorageStorage, MemoryStorage } from './core/adapters/local-storage-storage.js';
export { FetchTransport } from './core/adapters/fetch-transport.js';
export type { FetchTransportOptions } from './core/adapters/fetch-transport.js';
export { WebCryptoAdapter } from './core/adapters/web-crypto.js';
export { SystemClock, FixedClock } from './core/adapters/system-clock.js';
export { ConsoleLogger, NoOpLogger } from './core/adapters/loggers.js';
export {
    BroadcastChannelAdapter,
    NoOpBroadcast,
    createDefaultBroadcast,
} from './core/adapters/broadcast-channel.js';

// Building blocks — exported for advanced compositions (custom flow
// implementations, tests, etc.).
export { decodeAccessToken, tryDecodeAccessToken, secondsUntilExpiry, InvalidTokenError } from './core/token-decoder.js';
export { deriveS256Challenge, generatePKCEPair } from './core/pkce.js';
export type { PKCEPair } from './core/pkce.js';
export { RefreshMutex } from './core/refresh-mutex.js';
export { EventEmitter } from './core/event-emitter.js';

// Flows — exported so a consumer with very custom orchestration needs
// can compose them directly without going through the AuthClient facade.
export { LoginFlow } from './core/flows/login.flow.js';
export type { LoginRequest } from './core/flows/login.flow.js';
export { LogoutFlow } from './core/flows/logout.flow.js';
export type { LogoutRequest } from './core/flows/logout.flow.js';
export { RefreshFlow } from './core/flows/refresh.flow.js';
export type { RefreshRequest } from './core/flows/refresh.flow.js';
export { RegistrationFlow } from './core/flows/registration.flow.js';
export type { RegisterRequest } from './core/flows/registration.flow.js';
export { SsoFlow } from './core/flows/sso.flow.js';
export type {
    SsoStartRequest,
    SsoCompleteRequest,
} from './core/flows/sso.flow.js';
export { TotpFlow } from './core/flows/totp.flow.js';
export type { TotpDisableRequest } from './core/flows/totp.flow.js';
export { ImpersonationFlow } from './core/flows/impersonation.flow.js';
export type { ImpersonateRequest } from './core/flows/impersonation.flow.js';
export { AdminFlow } from './core/flows/admin.flow.js';
export type {
    HardDeleteUserRequest,
    LookupUsersRequest,
    LookupUserRecord,
} from './core/flows/admin.flow.js';
export type { FlowDeps } from './core/flows/flow-deps.js';

// Org admin types — surface them at the top level so consumers can
// pass these shapes through to their own components without reaching
// into the deep import path.
export type {
    OrgMemberRecord,
    OrgRoleRecord,
    AssignablePermissionRecord,
    InvitationRecord,
    CreateOrgRequest,
    UpdateOrgRequest,
    CreateOrgRoleRequest,
    UpdateOrgRoleRequest,
    UpdateMemberStatusRequest,
    CreateInvitationRequest,
} from './core/flows/org.flow.js';

// Sessions
export type { SessionRecord } from './core/flows/sessions.flow.js';

// Magic-link sign-in
export type {
    MagicLinkRequest,
    MagicLinkVerifyRequest,
} from './core/flows/magic-link.flow.js';

// Audit-log
export type {
    AuditLogEntry,
    AuditLogQuery,
    AuditLogResult,
} from './core/flows/audit-log.flow.js';

// Apps admin
export { AppsFlow } from './core/flows/apps.flow.js';
export type {
    AppRecord,
    CreateAppRequest,
    UpdateAppRequest,
    AppWebhook,
} from './core/flows/apps.flow.js';
export { APP_WEBHOOK_EVENTS } from './core/flows/apps.flow.js';

// M2M clients admin (the "Services" registry — machine credentials,
// system_admin only). Types originate in @rw3iss/auth-shared/dto.
export { M2MFlow } from './core/flows/m2m.flow.js';
export type {
    M2MClientRecord,
    CreateM2MClientRequest,
    CreateM2MClientResponse,
} from './core/flows/m2m.flow.js';

// User pools (namespaces) admin — system_admin only. Pool catalog is
// SDK-cached 60s for type-ahead pickers. Types originate in
// @rw3iss/auth-shared/dto.
export { NamespacesFlow } from './core/flows/namespaces.flow.js';
export type {
    NamespaceInfo,
    ListNamespacesResponse,
    UserNamespacesResponse,
} from './core/flows/namespaces.flow.js';
export type { AdminUserOrgMembership } from './core/flows/org.flow.js';

// Namespaced module API classes (instances live on AuthClient:
// client.auth / .account / .sessions / .users / .organizations /
// .apps / .services / .pools / .audit)
export {
    AuthModule,
    AccountModule,
    SessionsModule,
    UsersModule,
    OrganizationsModule,
    AppsModule,
    ServicesModule,
    PoolsModule,
    AuditModule,
} from './core/modules/index.js';

// Module architecture contract (advanced: custom modules / test stubs)
export type { ModuleContext, ClientFlows, CoreAuth } from './core/module-context.js';

// Retry options (transport)
export type { RetryOptions } from './core/adapters/fetch-transport.js';

// Optimistic action helper for adapters / advanced consumers
export { runOptimisticAction } from './framework-adapters/shared/action-state.js';

// Role helpers — re-export from @rw3iss/auth-shared/constants so a
// consumer that only depends on @rw3iss/auth-client has a single
// import path for role-related UI helpers. The canonical source still
// lives in auth-shared (used by server-tier packages too).
export {
    roleLabel,
    roleLabels,
    KNOWN_BASE_ROLE_LABELS,
    SYSTEM_ADMIN,
    SUPER_ADMIN,
    ORG_ADMIN,
    ORG_MANAGER,
    SELLER,
    BUYER,
    ORG_MEMBER,
    BASE_USER,
} from '@rw3iss/auth-shared/constants';
export type { RoleLike, RoleLabelOptions, SystemRoleCode } from '@rw3iss/auth-shared/constants';
