/**
 * `client.users` — back-office user administration (system_admin /
 * super_admin depending on the route): listing, lookup, base roles,
 * password override, session control, impersonation and hard delete.
 *
 * Related surfaces with their own module:
 *   - user↔app access grants → `client.apps`
 *   - user pools (namespaces) → `client.pools`
 *   - org memberships → `client.organizations`
 */
import type { ModuleContext } from '../module-context.js';
import type { ImpersonateParams } from '../auth-client.js';
import type { AuthResponse } from '../types.js';
export declare class UsersModule {
    private readonly ctx;
    constructor(ctx: ModuleContext);
    /** GET /admin/users — paginated list. Admin only. */
    list(req?: import('../flows/admin.flow.js').ListUsersRequest): Promise<import('../flows/admin.flow.js').ListUsersResult>;
    /**
     * Bulk-resolve users by email and/or id in a single call. Admin only
     * (system_admin or super_admin); 403 otherwise. Either input array
     * may be omitted; both empty returns an empty array.
     *
     * Use this when a back-office tool needs to render N users from a
     * mix of identifiers — e.g. "look up these 30 emails" — instead of
     * issuing N separate /admin/users requests.
     */
    lookup(req: {
        emails?: string[];
        ids?: string[];
    }): Promise<import('../flows/admin.flow.js').LookupUserRecord[]>;
    /** GET /admin/users/{id}/organizations — a user's org memberships. */
    getOrganizations(userId: string): Promise<import('../flows/org.flow.js').AdminUserOrgMembership[]>;
    /** GET /admin/users/{id}/roles — list a target user's current base roles. Admin only. */
    listRoles(userId: string): Promise<import("../flows/admin.flow.js").UserRoleRecord[]>;
    /** PUT /admin/users/{id}/roles — replace base roles. Admin only. */
    setRoles(userId: string, roleCodes: string[]): Promise<void>;
    /** POST /auth/admin/set-password — reset a user's password. Admin only. */
    setPassword(userId: string, newPassword: string): Promise<void>;
    /**
     * GET /admin/users/{userId}/sessions — list a target user's
     * active sessions. Admin only. See `getSessions()` for the
     * self-service equivalent.
     */
    listSessions(userId: string): Promise<import("@vendidit/auth-shared").SessionRecord[]>;
    /**
     * DELETE /admin/users/{userId}/sessions/{sessionId} — terminate
     * one specific session belonging to a target user. Admin only.
     * Granular counterpart to `adminRevokeUserSessions()`.
     */
    terminateSession(userId: string, sessionId: string): Promise<void>;
    /**
     * POST /admin/users/{userId}/revoke-sessions — terminate every
     * session for a target user. Admin only. Equivalent of
     * `logoutAll()` applied to someone else.
     */
    revokeSessions(userId: string): Promise<void>;
    /**
     * POST /admin/users/{userId}/reset-lockout — clear a target user's
     * failed-login counter + account lock. system_admin only.
     */
    resetLockout(userId: string): Promise<void>;
    /** Impersonate another user (AUDIT C7). The caller's token must carry
     * a role authorized for impersonation (system_admin / super_admin
     * anywhere, org_admin within their org). On success, the SDK swaps
     * in the new token pair so subsequent requests act as the target. */
    impersonate(params: ImpersonateParams): Promise<AuthResponse>;
    /** Hard-delete a user (AUDIT C8). system_admin only — server-side
     * gate. */
    hardDelete(params: {
        userId: string;
        reason: string;
    }): Promise<void>;
}
//# sourceMappingURL=users.module.d.ts.map