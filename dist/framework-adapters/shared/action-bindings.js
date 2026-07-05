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
/** Map of public action name → (client) => bound flow method. */
export const ACTION_BINDINGS = {
    /** Password login. Accepts the same params as AuthClient.loginWithPassword. */
    login: (client) => (params) => client.auth.login(params),
    /** Register a new user. */
    register: (client) => (params) => client.auth.register(params),
    /** Logout current session. */
    logout: (client) => () => client.auth.logout(),
    /** Logout all sessions for the current user. */
    logoutAll: (client) => () => client.auth.logoutAll(),
    /** Begin SSO. */
    startSso: (client) => (params) => client.auth.startSso(params),
    /** Complete SSO. */
    completeSso: (client) => (params) => client.auth.completeSso(params),
    /** Refresh tokens manually. */
    refresh: (client) => () => client.auth.refresh(),
    /** Re-fetch current user from /auth/me. */
    whoami: (client) => () => client.auth.whoami(),
    /** Begin TOTP enrollment. */
    setupTwoFactor: (client) => () => client.account.setupTwoFactor(),
    /** Confirm TOTP enrollment with the first code. */
    enableTwoFactor: (client) => (code) => client.account.enableTwoFactor(code),
    /** Disable TOTP. */
    disableTwoFactor: (client) => (params) => client.account.disableTwoFactor(params),
    /** Impersonate another user. */
    impersonate: (client) => (params) => client.users.impersonate(params),
    /** Hard-delete a user (system_admin only). */
    hardDeleteUser: (client) => (params) => client.users.hardDelete(params),
    /** Request a password-reset email. Anonymous flow. */
    requestPasswordReset: (client) => (params) => client.account.requestPasswordReset(params.email, params.appCode),
    /** Complete a password reset using a single-use token. */
    resetPassword: (client) => (params) => client.account.resetPassword(params.token, params.newPassword),
    /** Change the current user's password. Authenticated. */
    changePassword: (client) => (params) => client.account.changePassword(params.currentPassword, params.newPassword),
    /** Consume an email-verification token. */
    verifyEmail: (client) => (token) => client.account.verifyEmail(token),
    /** Re-issue a verification email. */
    resendVerificationEmail: (client) => (params) => client.account.resendVerificationEmail(params.email, params.appCode),
    /** List active sessions for the current user. */
    getSessions: (client) => () => client.sessions.list(),
    /** Terminate a specific session by id. */
    terminateSession: (client) => (sessionId) => client.sessions.terminate(sessionId),
    /** Fetch the current user's organization memberships (self-service). */
    getMyOrgs: (client) => () => client.account.getMyOrgs(),
    /** Admin: bulk-resolve users by email/id. */
    getUsersBulk: (client) => (req) => client.users.lookup(req),
    /** Switch the active organization context for the current session. */
    switchOrg: (client) => (organizationId) => client.auth.switchOrg(organizationId),
    /* ── Org administration ───────────────────────────────────────── */
    getOrg: (client) => (orgId) => client.organizations.get(orgId),
    updateOrg: (client) => (params) => client.organizations.update(params.orgId, params.body),
    createOrg: (client) => (body) => client.organizations.create(body),
    deleteOrg: (client) => (orgId) => client.organizations.delete(orgId),
    /** Admin-pathed counterparts that hit `/admin/organizations/*`,
     *  intended for back-office UIs operated by non-member system_admins. */
    adminGetOrg: (client) => (orgId) => client.organizations.adminGet(orgId),
    adminUpdateOrg: (client) => (params) => client.organizations.adminUpdate(params.orgId, params.body),
    adminListOrgMembers: (client) => (orgId) => client.organizations.adminListMembers(orgId),
    adminSetOrgMemberRoles: (client) => (params) => client.organizations.setMemberRoles(params.orgId, params.userId, params.roleCodes),
    listOrgMembers: (client) => (orgId) => client.organizations.listMembers(orgId),
    removeOrgMember: (client) => (params) => client.organizations.removeMember(params.orgId, params.userId),
    updateOrgMemberStatus: (client) => (params) => client.organizations.updateMemberStatus(params.orgId, params.userId, params.status),
    listOrgRoles: (client) => (orgId) => client.organizations.listRoles(orgId),
    getOrgRole: (client) => (params) => client.organizations.getRole(params.orgId, params.roleId),
    createOrgRole: (client) => (params) => client.organizations.createRole(params.orgId, params.body),
    updateOrgRole: (client) => (params) => client.organizations.updateRole(params.orgId, params.roleId, params.body),
    deleteOrgRole: (client) => (params) => client.organizations.deleteRole(params.orgId, params.roleId),
    listAssignablePermissions: (client) => (orgId) => client.organizations.listAssignablePermissions(orgId),
    createInvitation: (client) => (params) => client.organizations.createInvitation(params.orgId, params.body),
    listOrgInvitations: (client) => (orgId) => client.organizations.listInvitations(orgId),
    revokeInvitation: (client) => (params) => client.organizations.revokeInvitation(params.orgId, params.invitationId),
    listMyInvitations: (client) => () => client.account.listMyInvitations(),
    acceptInvitation: (client) => (invitationId) => client.account.acceptInvitation(invitationId),
    declineInvitation: (client) => (invitationId) => client.account.declineInvitation(invitationId),
    /** Fetch the public app registration policy. Anonymous; UX hints only. */
    getRegistrationPolicy: (client) => (appCode) => client.auth.getRegistrationPolicy(appCode),
    /** Admin: paginated list of users. */
    listUsers: (client) => (req) => client.users.list(req),
    /** Admin: list a target user's currently-assigned base roles. */
    listUserRoles: (client) => (userId) => client.users.listRoles(userId),
    /** Admin: replace a user's base roles. */
    setUserRoles: (client) => (params) => client.users.setRoles(params.userId, params.roleCodes),
    /** Admin: reset a user's password. */
    setUserPassword: (client) => (params) => client.users.setPassword(params.userId, params.newPassword),
    /** Admin: list every active session for a target user. */
    adminListUserSessions: (client) => (userId) => client.users.listSessions(userId),
    /** Admin: terminate one specific session for a target user. */
    adminTerminateUserSession: (client) => (params) => client.users.terminateSession(params.userId, params.sessionId),
    /** Admin: terminate every session for a target user. */
    adminRevokeUserSessions: (client) => (userId) => client.users.revokeSessions(userId),
    /** Admin: clear a target user's failed-login lockout (count + lock). */
    adminResetLockout: (client) => (userId) => client.users.resetLockout(userId),
    /** Request a magic-link sign-in email. Anonymous flow. */
    requestMagicLink: (client) => (params) => client.auth.requestMagicLink(params.email, params.appCode),
    /** Verify a magic-link token and complete sign-in. */
    verifyMagicLink: (client) => (token) => client.auth.verifyMagicLink(token),
    /** Admin: paginated audit-log query. */
    listAuditLog: (client) => (q) => client.audit.list(q),
    /** Self-service account deletion. Authenticated. */
    deleteMyAccount: (client) => (currentPassword) => client.account.deleteMyAccount(currentPassword),
    /* ── Org administration (list-all, for back-office pickers) ───── */
    listAllOrgs: (client) => () => client.organizations.list(),
    /* ── Apps administration (admin-chain reads, system-admin writes) */
    listApps: (client) => () => client.apps.list(),
    getApp: (client) => (appId) => client.apps.get(appId),
    createApp: (client) => (body) => client.apps.create(body),
    updateApp: (client) => (params) => client.apps.update(params.appId, params.body),
    deleteApp: (client) => (appId) => client.apps.delete(appId),
    /* ── User pools (namespaces; system_admin only) ───────────────── */
    listNamespaces: (client) => (opts) => client.pools.list(opts),
    getUserNamespaces: (client) => (userId) => client.pools.getForUser(userId),
    setUserHomeNamespace: (client) => (params) => client.pools.setUserHome(params.userId, params.namespace),
    addUserNamespace: (client) => (params) => client.pools.addUser(params.userId, params.namespace),
    removeUserNamespace: (client) => (params) => client.pools.removeUser(params.userId, params.namespace),
    /* ── Admin user↔app / user↔org membership management ──────────── */
    adminListUserApps: (client) => (userId) => client.apps.listForUser(userId),
    adminGrantUserApp: (client) => (params) => client.apps.grantUser(params.userId, params.appId),
    adminRevokeUserApp: (client) => (params) => client.apps.revokeUser(params.userId, params.appId),
    adminGetUserOrganizations: (client) => (userId) => client.users.getOrganizations(userId),
    adminRemoveOrgMember: (client) => (params) => client.organizations.adminRemoveMember(params.orgId, params.userId),
    adminAddOrgMember: (client) => (params) => client.organizations.addMember(params.orgId, params.userId, params.roleIds ?? []),
    /* ── M2M clients (the "Services" registry; system_admin only) ── */
    listM2MClients: (client) => () => client.services.list(),
    getM2MClient: (client) => (id) => client.services.get(id),
    createM2MClient: (client) => (body) => client.services.create(body),
    revokeM2MClient: (client) => (id) => client.services.revoke(id),
};
//# sourceMappingURL=action-bindings.js.map