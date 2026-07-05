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
import { ensureOk } from './flow-deps.js';
export class AdminFlow {
    deps;
    constructor(deps) {
        this.deps = deps;
    }
    async hardDeleteUser(req) {
        const resp = await this.deps.ports.transport.request({
            method: 'DELETE',
            url: `${this.deps.apiBaseUrl}/admin/users/${encodeURIComponent(req.userId)}/hard`,
            body: { reason: req.reason },
        });
        await ensureOk(resp);
    }
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
    async getUsersBulk(req) {
        const resp = await this.deps.ports.transport.request({
            method: 'POST',
            url: `${this.deps.apiBaseUrl}/admin/users/lookup`,
            body: { emails: req.emails ?? [], ids: req.ids ?? [] },
        });
        await ensureOk(resp);
        return resp.body?.users ?? [];
    }
    /**
     * GET /admin/users — paginated list of every user the caller can
     * see. Optional `search` does a full-text match server-side (email
     * + display name). Page numbers are 1-indexed.
     *
     * Requires an admin token (system_admin or super_admin).
     */
    async listUsers(req = {}) {
        const params = new URLSearchParams();
        if (req.search)
            params.set('search', req.search);
        if (req.page)
            params.set('page', String(req.page));
        if (req.pageSize)
            params.set('page_size', String(req.pageSize));
        if (req.organizationId)
            params.set('organization_id', req.organizationId);
        if (req.appId)
            params.set('app_id', req.appId);
        const qs = params.toString();
        const resp = await this.deps.ports.transport.request({
            method: 'GET',
            url: `${this.deps.apiBaseUrl}/admin/users${qs ? '?' + qs : ''}`,
        });
        await ensureOk(resp);
        return resp.body ?? { users: [], total: 0 };
    }
    /**
     * GET /admin/users/{userId}/roles — list a user's currently-assigned
     * base roles. Used by back-office UIs to render which checkboxes
     * should be pre-checked before the admin edits the set.
     *
     * Requires an admin token (system_admin or super_admin).
     */
    async listUserRoles(userId) {
        const resp = await this.deps.ports.transport.request({
            method: 'GET',
            url: `${this.deps.apiBaseUrl}/admin/users/${encodeURIComponent(userId)}/roles`,
        });
        await ensureOk(resp);
        return resp.body?.roles ?? [];
    }
    /**
     * PUT /admin/users/{userId}/roles — replace a user's base roles
     * with the supplied role codes. Server validates that every code
     * is a known role and that the caller has the authority to grant
     * each (`super_admin` cannot grant `system_admin`).
     */
    async setUserRoles(userId, roleCodes) {
        const resp = await this.deps.ports.transport.request({
            method: 'PUT',
            url: `${this.deps.apiBaseUrl}/admin/users/${encodeURIComponent(userId)}/roles`,
            body: { role_codes: roleCodes },
        });
        await ensureOk(resp);
    }
    /**
     * POST /auth/admin/set-password — set a user's password without
     * needing their current credentials. Authenticated admin-only.
     */
    async setUserPassword(userId, newPassword) {
        const resp = await this.deps.ports.transport.request({
            method: 'POST',
            url: `${this.deps.apiBaseUrl}/auth/admin/set-password`,
            body: { user_id: userId, new_password: newPassword },
        });
        await ensureOk(resp);
    }
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
    async listUserSessions(userId) {
        const resp = await this.deps.ports.transport.request({
            method: 'GET',
            url: `${this.deps.apiBaseUrl}/admin/users/${encodeURIComponent(userId)}/sessions`,
        });
        await ensureOk(resp);
        return resp.body ?? [];
    }
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
    async terminateUserSession(userId, sessionId) {
        const resp = await this.deps.ports.transport.request({
            method: 'DELETE',
            url: `${this.deps.apiBaseUrl}/admin/users/${encodeURIComponent(userId)}/sessions/${encodeURIComponent(sessionId)}`,
        });
        await ensureOk(resp);
    }
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
    async revokeUserSessions(userId) {
        const resp = await this.deps.ports.transport.request({
            method: 'POST',
            url: `${this.deps.apiBaseUrl}/admin/users/${encodeURIComponent(userId)}/revoke-sessions`,
        });
        await ensureOk(resp);
    }
    /**
     * POST /admin/users/{userId}/reset-lockout — clear a user's failed-login
     * counter + account lock (unlock an account locked by bad passwords).
     *
     * Requires a system_admin token.
     */
    async resetLockout(userId) {
        const resp = await this.deps.ports.transport.request({
            method: 'POST',
            url: `${this.deps.apiBaseUrl}/admin/users/${encodeURIComponent(userId)}/reset-lockout`,
        });
        await ensureOk(resp);
    }
}
//# sourceMappingURL=admin.flow.js.map