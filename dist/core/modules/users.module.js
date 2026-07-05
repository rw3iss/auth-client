export class UsersModule {
    ctx;
    constructor(ctx) {
        this.ctx = ctx;
    }
    /** GET /admin/users — paginated list. Admin only. */
    async list(req) {
        this.ctx.guard('listUsers');
        return this.ctx.flows.admin.listUsers(req);
    }
    /**
     * Bulk-resolve users by email and/or id in a single call. Admin only
     * (system_admin or super_admin); 403 otherwise. Either input array
     * may be omitted; both empty returns an empty array.
     *
     * Use this when a back-office tool needs to render N users from a
     * mix of identifiers — e.g. "look up these 30 emails" — instead of
     * issuing N separate /admin/users requests.
     */
    async lookup(req) {
        this.ctx.guard('getUsersBulk');
        return this.ctx.flows.admin.getUsersBulk(req);
    }
    /** GET /admin/users/{id}/organizations — a user's org memberships. */
    async getOrganizations(userId) {
        this.ctx.guard('adminGetUserOrganizations');
        return this.ctx.flows.org.adminGetUserOrganizations(userId);
    }
    /** GET /admin/users/{id}/roles — list a target user's current base roles. Admin only. */
    async listRoles(userId) {
        this.ctx.guard('listUserRoles');
        return this.ctx.flows.admin.listUserRoles(userId);
    }
    /** PUT /admin/users/{id}/roles — replace base roles. Admin only. */
    async setRoles(userId, roleCodes) {
        this.ctx.guard('setUserRoles');
        return this.ctx.flows.admin.setUserRoles(userId, roleCodes);
    }
    /** POST /auth/admin/set-password — reset a user's password. Admin only. */
    async setPassword(userId, newPassword) {
        this.ctx.guard('setUserPassword');
        return this.ctx.flows.admin.setUserPassword(userId, newPassword);
    }
    /**
     * GET /admin/users/{userId}/sessions — list a target user's
     * active sessions. Admin only. See `getSessions()` for the
     * self-service equivalent.
     */
    async listSessions(userId) {
        this.ctx.guard('adminListUserSessions');
        return this.ctx.flows.admin.listUserSessions(userId);
    }
    /**
     * DELETE /admin/users/{userId}/sessions/{sessionId} — terminate
     * one specific session belonging to a target user. Admin only.
     * Granular counterpart to `adminRevokeUserSessions()`.
     */
    async terminateSession(userId, sessionId) {
        this.ctx.guard('adminTerminateUserSession');
        return this.ctx.flows.admin.terminateUserSession(userId, sessionId);
    }
    /**
     * POST /admin/users/{userId}/revoke-sessions — terminate every
     * session for a target user. Admin only. Equivalent of
     * `logoutAll()` applied to someone else.
     */
    async revokeSessions(userId) {
        this.ctx.guard('adminRevokeUserSessions');
        return this.ctx.flows.admin.revokeUserSessions(userId);
    }
    /**
     * POST /admin/users/{userId}/reset-lockout — clear a target user's
     * failed-login counter + account lock. system_admin only.
     */
    async resetLockout(userId) {
        this.ctx.guard('adminResetLockout');
        return this.ctx.flows.admin.resetLockout(userId);
    }
    /** Impersonate another user (AUDIT C7). The caller's token must carry
     * a role authorized for impersonation (system_admin / super_admin
     * anywhere, org_admin within their org). On success, the SDK swaps
     * in the new token pair so subsequent requests act as the target. */
    async impersonate(params) {
        return this.ctx.core.impersonate(params);
    }
    /** Hard-delete a user (AUDIT C8). system_admin only — server-side
     * gate. */
    async hardDelete(params) {
        this.ctx.guard('hardDeleteUser');
        await this.ctx.flows.admin.hardDeleteUser(params);
    }
}
//# sourceMappingURL=users.module.js.map