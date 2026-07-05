/**
 * ModuleContext — the shared contract between the AuthClient core and
 * the namespaced API modules (src/core/modules/*).
 *
 * Architecture:
 *
 *   ┌────────────────────────────────────────────────────────────┐
 *   │ AuthClient (core)                                          │
 *   │  config · ports · reactive snapshot · token store ·        │
 *   │  refresh scheduling · cross-tab sync · session engine      │
 *   │  (login/logout/refresh/SSO-complete/… mutate state HERE)   │
 *   └──────────────┬─────────────────────────────────────────────┘
 *                  │ builds one ModuleContext, hands it to every module
 *   ┌──────────────▼─────────────────────────────────────────────┐
 *   │ Modules (client.auth / .account / .sessions / .users /     │
 *   │ .organizations / .apps / .services / .pools / .audit)      │
 *   │  OWN the endpoint implementations: ctx.guard() +           │
 *   │  ctx.flows.<flow>.<call>(). Session-mutating operations    │
 *   │  delegate to ctx.core — the session engine stays single-   │
 *   │  owner (SRP) while modules stay stateless and isolated.    │
 *   └────────────────────────────────────────────────────────────┘
 *
 * Modules never touch client state directly and never construct
 * flows — everything arrives through this context, which keeps them
 * trivially testable (pass a stub context) and keeps the dependency
 * direction one-way: modules → context ← core.
 */

import type { LoginFlow } from './flows/login.flow.js';
import type { LogoutFlow } from './flows/logout.flow.js';
import type { RefreshFlow } from './flows/refresh.flow.js';
import type { RegistrationFlow } from './flows/registration.flow.js';
import type { SsoFlow } from './flows/sso.flow.js';
import type { TotpFlow } from './flows/totp.flow.js';
import type { ImpersonationFlow } from './flows/impersonation.flow.js';
import type { AdminFlow } from './flows/admin.flow.js';
import type { PasswordFlow } from './flows/password.flow.js';
import type { EmailVerificationFlow } from './flows/email-verification.flow.js';
import type { SessionsFlow } from './flows/sessions.flow.js';
import type { OrgFlow } from './flows/org.flow.js';
import type { AppsFlow } from './flows/apps.flow.js';
import type { M2MFlow } from './flows/m2m.flow.js';
import type { NamespacesFlow } from './flows/namespaces.flow.js';
import type { MagicLinkFlow } from './flows/magic-link.flow.js';
import type { AuditLogFlow } from './flows/audit-log.flow.js';
import type { AuthClient } from './auth-client.js';

/** Every flow instance the core constructs, by stable name. */
export interface ClientFlows {
    login: LoginFlow;
    logout: LogoutFlow;
    refresh: RefreshFlow;
    registration: RegistrationFlow;
    sso: SsoFlow;
    totp: TotpFlow;
    impersonation: ImpersonationFlow;
    admin: AdminFlow;
    password: PasswordFlow;
    emailVerification: EmailVerificationFlow;
    sessions: SessionsFlow;
    org: OrgFlow;
    apps: AppsFlow;
    m2m: M2MFlow;
    namespaces: NamespacesFlow;
    magicLink: MagicLinkFlow;
    auditLog: AuditLogFlow;
}

/**
 * The session-engine primitives modules may delegate to — exactly the
 * operations that must mutate client state (tokens, snapshot, events)
 * and therefore stay implemented on the core. Everything else a module
 * implements itself via `flows`.
 */
export type CoreAuth = Pick<
    AuthClient,
    | 'loginWithPassword'
    | 'register'
    | 'completeSso'
    | 'logoutCurrent'
    | 'logoutAll'
    | 'refreshAccessToken'
    | 'switchOrg'
    | 'whoami'
    | 'getMyOrgs'
    | 'requestMagicLink'
    | 'verifyMagicLink'
    | 'getRegistrationPolicy'
    | 'impersonate'
    | 'disableTwoFactor'
    | 'deleteMyAccount'
    | 'getAccessToken'
    | 'isAuthenticated'
    | 'getDecodedClaims'
    | 'getCurrentUser'
    | 'isImpersonating'
>;

export interface ModuleContext {
    flows: ClientFlows;
    /** Throws OfflineModeError when the client runs in offline mode. */
    guard(operation: string): void;
    /** Session-engine primitives (see CoreAuth). */
    core: CoreAuth;
}
