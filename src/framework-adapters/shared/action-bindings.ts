/**
 * Method-binding table — maps each "action name" the framework adapters
 * expose (useLogin, useRegister, ...) to the underlying AuthClient
 * method. Centralizing the mapping here means a new flow added to the
 * core AuthClient surfaces in every adapter by adding ONE row to this
 * table rather than touching five adapter files.
 *
 * Each binding is `(client) => method` so adapters can call the
 * method with the right `this` context without leaking the AuthClient
 * instance into the action signature.
 *
 * Why not just `client.loginWithPassword.bind(client)`? Because the
 * "hook" form benefits from naming: `useLogin` is more idiomatic than
 * `useLoginWithPassword` (login is the user-facing operation; the
 * "with password" qualifier is internal).
 */

import type { AuthClient, ImpersonateParams, LoginParams, RegisterParams, SsoStartParams } from '../../core/auth-client.js';
import type { AuthResponse, TokenPair, User } from '../../core/types.js';

/** Map of public action name → (client) => bound flow method. */
export const ACTION_BINDINGS = {
    /** Password login. Accepts the same params as AuthClient.loginWithPassword. */
    login: (client: AuthClient) =>
        (params: LoginParams): Promise<AuthResponse> =>
            client.auth.login(params),

    /** Register a new user. */
    register: (client: AuthClient) =>
        (params: RegisterParams): Promise<AuthResponse> => client.auth.register(params),

    /** Logout current session. */
    logout: (client: AuthClient) =>
        (): Promise<void> => client.auth.logout(),

    /** Logout all sessions for the current user. */
    logoutAll: (client: AuthClient) =>
        (): Promise<void> => client.auth.logoutAll(),

    /** Begin SSO. */
    startSso: (client: AuthClient) =>
        (params: SsoStartParams) => client.auth.startSso(params),

    /** Complete SSO. */
    completeSso: (client: AuthClient) =>
        (params: { code: string; state: string; provider?: string }): Promise<AuthResponse> =>
            client.auth.completeSso(params),

    /** Refresh tokens manually. */
    refresh: (client: AuthClient) =>
        (): Promise<TokenPair> => client.auth.refresh(),

    /** Re-fetch current user from /auth/me. */
    whoami: (client: AuthClient) => (): Promise<User> => client.auth.whoami(),

    /** Begin TOTP enrollment. */
    setupTwoFactor: (client: AuthClient) =>
        (): Promise<{ secret: string; provisioningUri: string }> =>
            client.account.setupTwoFactor(),

    /** Confirm TOTP enrollment with the first code. */
    enableTwoFactor: (client: AuthClient) =>
        (code: string): Promise<void> => client.account.enableTwoFactor(code),

    /** Disable TOTP. */
    disableTwoFactor: (client: AuthClient) =>
        (params: { password: string; code: string }): Promise<void> =>
            client.account.disableTwoFactor(params),

    /** Impersonate another user. */
    impersonate: (client: AuthClient) =>
        (params: ImpersonateParams): Promise<AuthResponse> =>
            client.users.impersonate(params),

    /** Hard-delete a user (system_admin only). */
    hardDeleteUser: (client: AuthClient) =>
        (params: { userId: string; reason: string }): Promise<void> =>
            client.users.hardDelete(params),

    /** Request a password-reset email. Anonymous flow. */
    requestPasswordReset: (client: AuthClient) =>
        (params: { email: string; appCode?: string }): Promise<void> =>
            client.account.requestPasswordReset(params.email, params.appCode),

    /** Complete a password reset using a single-use token. */
    resetPassword: (client: AuthClient) =>
        (params: { token: string; newPassword: string }): Promise<void> =>
            client.account.resetPassword(params.token, params.newPassword),

    /** Change the current user's password. Authenticated. */
    changePassword: (client: AuthClient) =>
        (params: { currentPassword: string; newPassword: string }): Promise<void> =>
            client.account.changePassword(params.currentPassword, params.newPassword),

    /** Consume an email-verification token. */
    verifyEmail: (client: AuthClient) =>
        (token: string): Promise<void> => client.account.verifyEmail(token),

    /** Re-issue a verification email. */
    resendVerificationEmail: (client: AuthClient) =>
        (params: { email: string; appCode?: string }): Promise<void> =>
            client.account.resendVerificationEmail(params.email, params.appCode),

    /** List active sessions for the current user. */
    getSessions: (client: AuthClient) =>
        (): Promise<import('../../core/flows/sessions.flow.js').SessionRecord[]> =>
            client.sessions.list(),

    /** Terminate a specific session by id. */
    terminateSession: (client: AuthClient) =>
        (sessionId: string): Promise<void> => client.sessions.terminate(sessionId),

    /** Fetch the current user's organization memberships (self-service). */
    getMyOrgs: (client: AuthClient) =>
        (): Promise<import('../../core/types.js').MyOrgRecord[]> =>
            client.account.getMyOrgs(),

    /** Admin: bulk-resolve users by email/id. */
    getUsersBulk: (client: AuthClient) =>
        (req: { emails?: string[]; ids?: string[] }) =>
            client.users.lookup(req),

    /** Switch the active organization context for the current session. */
    switchOrg: (client: AuthClient) =>
        (organizationId: string) => client.auth.switchOrg(organizationId),

    /* ── Org administration ───────────────────────────────────────── */
    getOrg: (client: AuthClient) =>
        (orgId: string) => client.organizations.get(orgId),
    updateOrg: (client: AuthClient) =>
        (params: { orgId: string; body: import('../../core/flows/org.flow.js').UpdateOrgRequest }) =>
            client.organizations.update(params.orgId, params.body),
    createOrg: (client: AuthClient) =>
        (body: import('../../core/flows/org.flow.js').CreateOrgRequest) =>
            client.organizations.create(body),
    deleteOrg: (client: AuthClient) =>
        (orgId: string) => client.organizations.delete(orgId),

    /** Admin-pathed counterparts that hit `/admin/organizations/*`,
     *  intended for back-office UIs operated by non-member system_admins. */
    adminGetOrg: (client: AuthClient) =>
        (orgId: string) => client.organizations.adminGet(orgId),
    adminUpdateOrg: (client: AuthClient) =>
        (params: { orgId: string; body: import('../../core/flows/org.flow.js').UpdateOrgRequest }) =>
            client.organizations.adminUpdate(params.orgId, params.body),
    adminListOrgMembers: (client: AuthClient) =>
        (orgId: string) => client.organizations.adminListMembers(orgId),
    adminSetOrgMemberRoles: (client: AuthClient) =>
        (params: { orgId: string; userId: string; roleCodes: string[] }) =>
            client.organizations.setMemberRoles(params.orgId, params.userId, params.roleCodes),

    listOrgMembers: (client: AuthClient) =>
        (orgId: string) => client.organizations.listMembers(orgId),
    removeOrgMember: (client: AuthClient) =>
        (params: { orgId: string; userId: string }) =>
            client.organizations.removeMember(params.orgId, params.userId),
    updateOrgMemberStatus: (client: AuthClient) =>
        (params: { orgId: string; userId: string; status: string }) =>
            client.organizations.updateMemberStatus(params.orgId, params.userId, params.status),

    listOrgRoles: (client: AuthClient) =>
        (orgId: string) => client.organizations.listRoles(orgId),
    getOrgRole: (client: AuthClient) =>
        (params: { orgId: string; roleId: string }) =>
            client.organizations.getRole(params.orgId, params.roleId),
    createOrgRole: (client: AuthClient) =>
        (params: { orgId: string; body: import('../../core/flows/org.flow.js').CreateOrgRoleRequest }) =>
            client.organizations.createRole(params.orgId, params.body),
    updateOrgRole: (client: AuthClient) =>
        (params: { orgId: string; roleId: string; body: import('../../core/flows/org.flow.js').UpdateOrgRoleRequest }) =>
            client.organizations.updateRole(params.orgId, params.roleId, params.body),
    deleteOrgRole: (client: AuthClient) =>
        (params: { orgId: string; roleId: string }) =>
            client.organizations.deleteRole(params.orgId, params.roleId),
    listAssignablePermissions: (client: AuthClient) =>
        (orgId: string) => client.organizations.listAssignablePermissions(orgId),

    createInvitation: (client: AuthClient) =>
        (params: { orgId: string; body: import('../../core/flows/org.flow.js').CreateInvitationRequest }) =>
            client.organizations.createInvitation(params.orgId, params.body),
    listOrgInvitations: (client: AuthClient) =>
        (orgId: string) => client.organizations.listInvitations(orgId),
    revokeInvitation: (client: AuthClient) =>
        (params: { orgId: string; invitationId: string }) =>
            client.organizations.revokeInvitation(params.orgId, params.invitationId),
    listMyInvitations: (client: AuthClient) =>
        () => client.account.listMyInvitations(),
    acceptInvitation: (client: AuthClient) =>
        (invitationId: string) => client.account.acceptInvitation(invitationId),
    declineInvitation: (client: AuthClient) =>
        (invitationId: string) => client.account.declineInvitation(invitationId),

    /** Fetch the public app registration policy. Anonymous; UX hints only. */
    getRegistrationPolicy: (client: AuthClient) =>
        (appCode?: string) => client.auth.getRegistrationPolicy(appCode),

    /** Admin: paginated list of users. */
    listUsers: (client: AuthClient) =>
        (req?: import('../../core/flows/admin.flow.js').ListUsersRequest) => client.users.list(req),
    /** Admin: list a target user's currently-assigned base roles. */
    listUserRoles: (client: AuthClient) =>
        (userId: string) => client.users.listRoles(userId),
    /** Admin: replace a user's base roles. */
    setUserRoles: (client: AuthClient) =>
        (params: { userId: string; roleCodes: string[] }) =>
            client.users.setRoles(params.userId, params.roleCodes),
    /** Admin: reset a user's password. */
    setUserPassword: (client: AuthClient) =>
        (params: { userId: string; newPassword: string }) =>
            client.users.setPassword(params.userId, params.newPassword),
    /** Admin: list every active session for a target user. */
    adminListUserSessions: (client: AuthClient) =>
        (userId: string) => client.users.listSessions(userId),
    /** Admin: terminate one specific session for a target user. */
    adminTerminateUserSession: (client: AuthClient) =>
        (params: { userId: string; sessionId: string }) =>
            client.users.terminateSession(params.userId, params.sessionId),
    /** Admin: terminate every session for a target user. */
    adminRevokeUserSessions: (client: AuthClient) =>
        (userId: string) => client.users.revokeSessions(userId),

    /** Admin: clear a target user's failed-login lockout (count + lock). */
    adminResetLockout: (client: AuthClient) =>
        (userId: string) => client.users.resetLockout(userId),

    /** Request a magic-link sign-in email. Anonymous flow. */
    requestMagicLink: (client: AuthClient) =>
        (params: { email: string; appCode?: string }) =>
            client.auth.requestMagicLink(params.email, params.appCode),

    /** Verify a magic-link token and complete sign-in. */
    verifyMagicLink: (client: AuthClient) =>
        (token: string) => client.auth.verifyMagicLink(token),

    /** Admin: paginated audit-log query. */
    listAuditLog: (client: AuthClient) =>
        (q?: import('../../core/flows/audit-log.flow.js').AuditLogQuery) =>
            client.audit.list(q),

    /** Self-service account deletion. Authenticated. */
    deleteMyAccount: (client: AuthClient) =>
        (currentPassword: string) => client.account.deleteMyAccount(currentPassword),

    /* ── Org administration (list-all, for back-office pickers) ───── */
    listAllOrgs: (client: AuthClient) =>
        () => client.organizations.list(),

    /* ── Apps administration (admin-chain reads, system-admin writes) */
    listApps: (client: AuthClient) =>
        () => client.apps.list(),
    getApp: (client: AuthClient) =>
        (appId: string) => client.apps.get(appId),
    createApp: (client: AuthClient) =>
        (body: import('../../core/flows/apps.flow.js').CreateAppRequest) =>
            client.apps.create(body),
    updateApp: (client: AuthClient) =>
        (params: { appId: string; body: import('../../core/flows/apps.flow.js').UpdateAppRequest }) =>
            client.apps.update(params.appId, params.body),
    deleteApp: (client: AuthClient) =>
        (appId: string) => client.apps.delete(appId),

    /* ── User pools (namespaces; system_admin only) ───────────────── */
    listNamespaces: (client: AuthClient) =>
        (opts?: { forceRefresh?: boolean }) => client.pools.list(opts),
    getUserNamespaces: (client: AuthClient) =>
        (userId: string) => client.pools.getForUser(userId),
    setUserHomeNamespace: (client: AuthClient) =>
        (params: { userId: string; namespace: string }) =>
            client.pools.setUserHome(params.userId, params.namespace),
    addUserNamespace: (client: AuthClient) =>
        (params: { userId: string; namespace: string }) =>
            client.pools.addUser(params.userId, params.namespace),
    removeUserNamespace: (client: AuthClient) =>
        (params: { userId: string; namespace: string }) =>
            client.pools.removeUser(params.userId, params.namespace),

    /* ── Admin user↔app / user↔org membership management ──────────── */
    adminListUserApps: (client: AuthClient) =>
        (userId: string) => client.apps.listForUser(userId),
    adminGrantUserApp: (client: AuthClient) =>
        (params: { userId: string; appId: string }) =>
            client.apps.grantUser(params.userId, params.appId),
    adminRevokeUserApp: (client: AuthClient) =>
        (params: { userId: string; appId: string }) =>
            client.apps.revokeUser(params.userId, params.appId),
    adminGetUserOrganizations: (client: AuthClient) =>
        (userId: string) => client.users.getOrganizations(userId),
    adminRemoveOrgMember: (client: AuthClient) =>
        (params: { orgId: string; userId: string }) =>
            client.organizations.adminRemoveMember(params.orgId, params.userId),
    adminAddOrgMember: (client: AuthClient) =>
        (params: { orgId: string; userId: string; roleIds?: string[] }) =>
            client.organizations.addMember(params.orgId, params.userId, params.roleIds ?? []),

    /* ── M2M clients (the "Services" registry; system_admin only) ── */
    listM2MClients: (client: AuthClient) =>
        () => client.services.list(),
    getM2MClient: (client: AuthClient) =>
        (id: string) => client.services.get(id),
    createM2MClient: (client: AuthClient) =>
        (body: import('../../core/flows/m2m.flow.js').CreateM2MClientRequest) =>
            client.services.create(body),
    revokeM2MClient: (client: AuthClient) =>
        (id: string) => client.services.revoke(id),
} as const;

export type ActionName = keyof typeof ACTION_BINDINGS;
