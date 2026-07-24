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
 *   appCode: 'marketplace-app',
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
// Errors
export { AuthError, ConflictError, ForbiddenError, fromHttpResponse, NetworkError, NotFoundError, OfflineModeError, RateLimitedError, RequiresTwoFactorError, ServerError, UnauthenticatedError, ValidationError, } from './core/errors.js';
// Adapters — exported so consumers can mix-and-match (e.g. wrap
// FetchTransport with retry, or use MemoryTokenStore for SSR).
export { LocalStorageTokenStore, MemoryTokenStore } from './core/adapters/local-storage-token-store.js';
export { LocalStorageStorage, MemoryStorage } from './core/adapters/local-storage-storage.js';
export { FetchTransport } from './core/adapters/fetch-transport.js';
export { WebCryptoAdapter } from './core/adapters/web-crypto.js';
export { SystemClock, FixedClock } from './core/adapters/system-clock.js';
export { ConsoleLogger, NoOpLogger } from './core/adapters/loggers.js';
export { BroadcastChannelAdapter, NoOpBroadcast, createDefaultBroadcast, } from './core/adapters/broadcast-channel.js';
// Building blocks — exported for advanced compositions (custom flow
// implementations, tests, etc.).
export { decodeAccessToken, tryDecodeAccessToken, secondsUntilExpiry, InvalidTokenError } from './core/token-decoder.js';
export { deriveS256Challenge, generatePKCEPair } from './core/pkce.js';
export { RefreshMutex } from './core/refresh-mutex.js';
export { EventEmitter } from './core/event-emitter.js';
// Flows — exported so a consumer with very custom orchestration needs
// can compose them directly without going through the AuthClient facade.
export { LoginFlow } from './core/flows/login.flow.js';
export { LogoutFlow } from './core/flows/logout.flow.js';
export { RefreshFlow } from './core/flows/refresh.flow.js';
export { RegistrationFlow } from './core/flows/registration.flow.js';
export { SsoFlow } from './core/flows/sso.flow.js';
export { TotpFlow } from './core/flows/totp.flow.js';
export { ImpersonationFlow } from './core/flows/impersonation.flow.js';
export { AdminFlow } from './core/flows/admin.flow.js';
// Apps admin
export { AppsFlow } from './core/flows/apps.flow.js';
export { APP_WEBHOOK_EVENTS } from './core/flows/apps.flow.js';
// M2M clients admin (the "Services" registry — machine credentials,
// system_admin only). Types originate in @rw3iss/auth-shared/dto.
export { M2MFlow } from './core/flows/m2m.flow.js';
// User pools (namespaces) admin — system_admin only. Pool catalog is
// SDK-cached 60s for type-ahead pickers. Types originate in
// @rw3iss/auth-shared/dto.
export { NamespacesFlow } from './core/flows/namespaces.flow.js';
// Namespaced module API classes (instances live on AuthClient:
// client.auth / .account / .sessions / .users / .organizations /
// .apps / .services / .pools / .audit)
export { AuthModule, AccountModule, SessionsModule, UsersModule, OrganizationsModule, AppsModule, ServicesModule, PoolsModule, AuditModule, } from './core/modules/index.js';
// Optimistic action helper for adapters / advanced consumers
export { runOptimisticAction } from './framework-adapters/shared/action-state.js';
// Role helpers — re-export from @rw3iss/auth-shared/constants so a
// consumer that only depends on @rw3iss/auth-client has a single
// import path for role-related UI helpers. The canonical source still
// lives in auth-shared (used by server-tier packages too).
export { roleLabel, roleLabels, KNOWN_BASE_ROLE_LABELS, SYSTEM_ADMIN, SUPER_ADMIN, ORG_ADMIN, ORG_MANAGER, ORG_MEMBER, BASE_USER, } from '@rw3iss/auth-shared/constants';
//# sourceMappingURL=index.js.map