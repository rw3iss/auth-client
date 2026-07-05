/**
 * Admin flows — server-side admin endpoints exposed for SDK consumers
 * that need them at the UI tier (back-office tools, internal dashboards).
 * Behind adminChain (system_admin OR super_admin) on the server; the
 * caller must already hold an admin token.
 *
 * The package's broader admin surface (org CRUD, user role management)
 * lives in the main marketplace SDK that composes auth-client, not here.
 * This file is the slim subset that's universal across consumers.
 */
import { type FlowDeps } from './flow-deps.js';
import type { SessionRecord } from './sessions.flow.js';
export interface HardDeleteUserRequest {
    userId: string;
    reason: string;
}
/**
 * Slim role record returned by GET /admin/users/{userId}/roles +
 * GET /admin/roles. Matches the auth-server's `RoleResponse` DTO —
 * snake_case preserved on the wire so consumers can hand the shape
 * straight to UI without remapping. `level` is the privilege ordering
 * (lower = more privileged); useful when sorting roles in a picker.
 */
export interface UserRoleRecord {
    id: string;
    code: string;
    name: string;
    description?: string;
    level?: number;
    scope?: string;
}
/**
 * Request body for bulk user lookup. Either array may be omitted; both
 * empty returns an empty result. Duplicates across emails+ids collapse
 * to one row in the response.
 */
export interface LookupUsersRequest {
    /** Up to 200 emails total (across emails + ids). */
    emails?: string[];
    /** Up to 200 ids total (across emails + ids). */
    ids?: string[];
}
/**
 * Per-user record returned by POST /admin/users/lookup. Mirrors the
 * server's user DTO — snake_case preserved so consumers can hand the
 * shape straight to UI / spreadsheet exports without remapping.
 *
 * Re-exported from `@rw3iss/auth-shared` so server-side consumers
 * (`@rw3iss/auth-server-ts`) and the browser SDK refer to the same
 * definition.
 */
export type { LookupUserRecord } from '@rw3iss/auth-shared';
import type { LookupUserRecord } from '@rw3iss/auth-shared';
export declare class AdminFlow {
    private readonly deps;
    constructor(deps: FlowDeps);
    hardDeleteUser(req: HardDeleteUserRequest): Promise<void>;
    /**
     * POST /admin/users/lookup — bulk-resolve users by email and/or id
     * in a single round-trip. Replaces the awkward
     * check-email-then-list-and-filter workflow back-office tools used
     * to implement (AUTH-PHP-LARAVEL-DESIGN §5).
     *
     * Soft-deleted users are excluded from the response. The order of
     * the returned array is not guaranteed; consumers that need a
     * specific order (e.g. matching the input email list) should index
     * the response by id/email themselves.
     *
     * Requires an admin token (system_admin or super_admin); 403 if the
     * caller isn't admin.
     */
    getUsersBulk(req: LookupUsersRequest): Promise<LookupUserRecord[]>;
    /**
     * GET /admin/users — paginated list of every user the caller can
     * see. Optional `search` does a full-text match server-side (email
     * + display name). Page numbers are 1-indexed.
     *
     * Requires an admin token (system_admin or super_admin).
     */
    listUsers(req?: ListUsersRequest): Promise<ListUsersResult>;
    /**
     * GET /admin/users/{userId}/roles — list a user's currently-assigned
     * base roles. Used by back-office UIs to render which checkboxes
     * should be pre-checked before the admin edits the set.
     *
     * Requires an admin token (system_admin or super_admin).
     */
    listUserRoles(userId: string): Promise<UserRoleRecord[]>;
    /**
     * PUT /admin/users/{userId}/roles — replace a user's base roles
     * with the supplied role codes. Server validates that every code
     * is a known role and that the caller has the authority to grant
     * each (`super_admin` cannot grant `system_admin`).
     */
    setUserRoles(userId: string, roleCodes: string[]): Promise<void>;
    /**
     * POST /auth/admin/set-password — set a user's password without
     * needing their current credentials. Authenticated admin-only.
     */
    setUserPassword(userId: string, newPassword: string): Promise<void>;
    /**
     * GET /admin/users/{userId}/sessions — list every active session
     * for a target user. Admin-side counterpart to the self-service
     * `getSessions()` flow; lets a back-office tool surface (and
     * surgically terminate) a user's sessions on their behalf.
     *
     * The server returns a bare array (mirrors /auth/sessions). The
     * `is_current` flag is never set here — it's meaningless when
     * the caller isn't the session's owner.
     *
     * Requires an admin token (system_admin or super_admin).
     */
    listUserSessions(userId: string): Promise<SessionRecord[]>;
    /**
     * DELETE /admin/users/{userId}/sessions/{sessionId} — terminate
     * one specific session belonging to a target user. The granular
     * counterpart to `revokeUserSessions()` (which kills every session
     * at once).
     *
     * The server enforces that `sessionId` belongs to `userId`; an
     * id-mismatch returns 404 rather than silently terminating the
     * wrong row.
     *
     * Requires an admin token (system_admin or super_admin).
     */
    terminateUserSession(userId: string, sessionId: string): Promise<void>;
    /**
     * POST /admin/users/{userId}/revoke-sessions — terminate every
     * session for a target user (logout-all-for-them). Admin-side
     * equivalent of /auth/logout/all the user might run themselves.
     *
     * Revokes every refresh-token and bumps the per-user
     * token-version so outstanding access tokens are rejected
     * cross-replica.
     *
     * Requires an admin token (system_admin or super_admin).
     */
    revokeUserSessions(userId: string): Promise<void>;
    /**
     * POST /admin/users/{userId}/reset-lockout — clear a user's failed-login
     * counter + account lock (unlock an account locked by bad passwords).
     *
     * Requires a system_admin token.
     */
    resetLockout(userId: string): Promise<void>;
}
/** Paginated list-users request. */
export interface ListUsersRequest {
    search?: string;
    page?: number;
    pageSize?: number;
    /** Filter to members of one organization (passed as `?organization_id=`).
     *  Server: filters via the organization_members join. Requires the
     *  user-handler to honor the param — older auth-server builds
     *  ignore it silently and return every user. */
    organizationId?: string;
    /** Filter to users granted membership in one app (passed as
     *  `?app_id=`). Server support for this is pending — the param
     *  is forwarded so backends that DO honor it work, and older
     *  ones ignore it without erroring. */
    appId?: string;
}
/** Paginated list-users response. */
export interface ListUsersResult {
    users: LookupUserRecord[];
    total: number;
}
//# sourceMappingURL=admin.flow.d.ts.map