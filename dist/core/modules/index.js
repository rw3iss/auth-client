/**
 * Namespaced module API — the recommended way to consume the SDK:
 *
 *   client.auth.login(...)            // credentials, session, identity
 *   client.account.changePassword(..) // own account: password/email/2FA/invites
 *   client.sessions.list()            // own device sessions
 *   client.users.list(...)            // admin: user administration
 *   client.organizations.get(...)     // org CRUD/members/roles/invitations
 *   client.apps.update(...)           // app registry + user app grants
 *   client.services.create(...)       // m2m machine credentials
 *   client.pools.list()               // user pools (namespaces)
 *   client.audit.list(...)            // audit log
 *
 * Modules OWN the endpoint implementations (HTTP via the shared flow
 * instances + the offline guard, both injected through ModuleContext).
 * The AuthClient core owns authentication context, token storage and
 * refresh; session-mutating operations (login, logout, refresh, SSO
 * completion, …) stay implemented there and are surfaced through
 * client.auth / client.account. See ../module-context.ts.
 */
export { AuthModule } from './auth.module.js';
export { AccountModule } from './account.module.js';
export { SessionsModule } from './sessions.module.js';
export { UsersModule } from './users.module.js';
export { OrganizationsModule } from './organizations.module.js';
export { AppsModule } from './apps.module.js';
export { ServicesModule } from './services.module.js';
export { PoolsModule } from './pools.module.js';
export { AuditModule } from './audit.module.js';
//# sourceMappingURL=index.js.map