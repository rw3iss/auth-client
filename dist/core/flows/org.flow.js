/**
 * Organization administration flow — wraps the server's org self-service
 * surface (`/orgs/{orgId}/*`) and `/admin/organizations/*`. Splits into
 * three concerns:
 *
 *   - **Org CRUD** — read/update settings for an org you're a member
 *     of; create/delete via the admin path (system_admin / super_admin).
 *
 *   - **Members** — list / remove / update status. Inviting by email
 *     is a separate concern (see InvitationsFlow below) because the
 *     server's `POST /orgs/{orgId}/members` requires an existing user
 *     id, whereas real-world "invite a teammate" UX wants email.
 *
 *   - **Custom roles** — list / get / create / update / delete
 *     per-org custom roles; list assignable permissions.
 *
 *   - **Invitations** — invite by email, list pending org-side,
 *     revoke; list / accept / decline on the invitee side
 *     (`/me/invitations`).
 *
 * The wire shapes mirror the server's response envelopes exactly so
 * the SDK can pass them straight through without remapping.
 */
import { ensureOk } from './flow-deps.js';
/* ──────────────────────────────────────────────────────────────────── */
/* OrgFlow                                                              */
/* ──────────────────────────────────────────────────────────────────── */
export class OrgFlow {
    deps;
    constructor(deps) {
        this.deps = deps;
    }
    /* ── Org CRUD ─────────────────────────────────────────────────── */
    /**
     * GET /admin/organizations — list every org. adminChain
     * (system_admin OR super_admin) on the server side. Used by
     * back-office admin UIs that need a full picker.
     */
    async listAll() {
        const resp = await this.deps.ports.transport.request({
            method: 'GET',
            url: `${this.deps.apiBaseUrl}/admin/organizations`,
        });
        await ensureOk(resp);
        const body = resp.body;
        // Server has historically wrapped admin list responses as
        // `{ organizations: [...] }`; tolerate both shapes for forward
        // compat in case the envelope ever changes.
        if (Array.isArray(body))
            return body;
        return body?.organizations ?? [];
    }
    /** GET /orgs/{orgId} — read settings for an org the caller belongs to. */
    async get(orgId) {
        const resp = await this.deps.ports.transport.request({
            method: 'GET',
            url: `${this.deps.apiBaseUrl}/orgs/${encodeURIComponent(orgId)}`,
        });
        await ensureOk(resp);
        return resp.body;
    }
    /** PUT /orgs/{orgId} — update settings. Requires `org:update`. */
    async update(orgId, body) {
        const resp = await this.deps.ports.transport.request({
            method: 'PUT',
            url: `${this.deps.apiBaseUrl}/orgs/${encodeURIComponent(orgId)}`,
            body,
        });
        await ensureOk(resp);
        return resp.body;
    }
    /**
     * GET /admin/organizations/{orgId} — back-office read. Goes through
     * the `adminChain` + `requireSystemAdmin` path so non-members
     * (specifically platform-admin operators who never joined the org)
     * can still inspect it. The user-self equivalent is `get()` above,
     * which requires org membership.
     */
    async adminGet(orgId) {
        const resp = await this.deps.ports.transport.request({
            method: 'GET',
            url: `${this.deps.apiBaseUrl}/admin/organizations/${encodeURIComponent(orgId)}`,
        });
        await ensureOk(resp);
        return resp.body;
    }
    /**
     * PUT /admin/organizations/{orgId} — back-office write. system_admin
     * only on the server. Accepts the broader admin field-set
     * (description, contact info, address, logo_url, …) that the
     * user-self `update()` doesn't expose.
     */
    async adminUpdate(orgId, body) {
        const resp = await this.deps.ports.transport.request({
            method: 'PUT',
            url: `${this.deps.apiBaseUrl}/admin/organizations/${encodeURIComponent(orgId)}`,
            body,
        });
        await ensureOk(resp);
        return resp.body;
    }
    /**
     * GET /admin/organizations/{orgId}/members — back-office member
     * listing. Used by admin UIs that need member counts / a roster
     * for orgs the caller isn't a member of.
     */
    async adminListMembers(orgId) {
        const resp = await this.deps.ports.transport.request({
            method: 'GET',
            url: `${this.deps.apiBaseUrl}/admin/organizations/${encodeURIComponent(orgId)}/members`,
        });
        await ensureOk(resp);
        return resp.body?.members ?? [];
    }
    /**
     * GET /admin/users/{userId}/organizations — admin view of every
     * org a user belongs to, with status + roles. system_admin only.
     */
    async adminGetUserOrganizations(userId) {
        const resp = await this.deps.ports.transport.request({
            method: 'GET',
            url: `${this.deps.apiBaseUrl}/admin/users/${encodeURIComponent(userId)}/organizations`,
        });
        await ensureOk(resp);
        return resp.body?.memberships ?? [];
    }
    /**
     * POST /admin/organizations/{orgId}/members — add an EXISTING user
     * to an org (system_admin only). Omit roleIds for the org_member
     * fallback role. For invite-by-email use createInvitation instead.
     */
    async adminAddMember(orgId, userId, roleIds = []) {
        const resp = await this.deps.ports.transport.request({
            method: 'POST',
            url: `${this.deps.apiBaseUrl}/admin/organizations/${encodeURIComponent(orgId)}/members`,
            body: { user_id: userId, role_ids: roleIds },
        });
        await ensureOk(resp);
    }
    /**
     * DELETE /admin/organizations/{orgId}/members/{userId} — remove a
     * member from any org (system_admin only; no org context needed,
     * unlike the self-service removeMember).
     */
    async adminRemoveMember(orgId, userId) {
        const resp = await this.deps.ports.transport.request({
            method: 'DELETE',
            url: `${this.deps.apiBaseUrl}/admin/organizations/${encodeURIComponent(orgId)}/members/${encodeURIComponent(userId)}`,
        });
        await ensureOk(resp);
    }
    /**
     * PUT /admin/organizations/{orgId}/members/{userId}/roles —
     * REPLACE a member's org-role set (set semantics: roles not
     * listed are removed; new ones assigned). Org-scoped role codes
     * only (`org_admin`, `org_manager`, `org_member`, or this org's
     * custom roles) — base/platform roles
     * are rejected; manage those via `setUserRoles`. system_admin only.
     *
     * Backs "change organization admin" UIs: promote the new admin
     * with `[...current, 'org_admin']`, demote the old with their
     * roles minus `org_admin`. Returns the refreshed membership.
     */
    async adminSetMemberRoles(orgId, userId, roleCodes) {
        const resp = await this.deps.ports.transport.request({
            method: 'PUT',
            url: `${this.deps.apiBaseUrl}/admin/organizations/${encodeURIComponent(orgId)}/members/${encodeURIComponent(userId)}/roles`,
            body: { role_codes: roleCodes },
        });
        await ensureOk(resp);
        return resp.body;
    }
    /**
     * POST /admin/organizations — create a new org. Admin-only on the
     * server side; surface it through this flow for the admin CLI / UI.
     */
    async create(body) {
        const resp = await this.deps.ports.transport.request({
            method: 'POST',
            url: `${this.deps.apiBaseUrl}/admin/organizations`,
            body,
        });
        await ensureOk(resp);
        return resp.body;
    }
    /** DELETE /admin/organizations/{orgId} — admin only. */
    async deleteOrg(orgId) {
        const resp = await this.deps.ports.transport.request({
            method: 'DELETE',
            url: `${this.deps.apiBaseUrl}/admin/organizations/${encodeURIComponent(orgId)}`,
        });
        await ensureOk(resp);
    }
    /* ── Members ──────────────────────────────────────────────────── */
    async listMembers(orgId) {
        const resp = await this.deps.ports.transport.request({
            method: 'GET',
            url: `${this.deps.apiBaseUrl}/orgs/${encodeURIComponent(orgId)}/members`,
        });
        await ensureOk(resp);
        return resp.body?.members ?? [];
    }
    async removeMember(orgId, userId) {
        const resp = await this.deps.ports.transport.request({
            method: 'DELETE',
            url: `${this.deps.apiBaseUrl}/orgs/${encodeURIComponent(orgId)}/members/${encodeURIComponent(userId)}`,
        });
        await ensureOk(resp);
    }
    async updateMemberStatus(orgId, userId, status) {
        const resp = await this.deps.ports.transport.request({
            method: 'PUT',
            url: `${this.deps.apiBaseUrl}/orgs/${encodeURIComponent(orgId)}/members/${encodeURIComponent(userId)}/status`,
            body: { status },
        });
        await ensureOk(resp);
    }
    /* ── Custom roles ─────────────────────────────────────────────── */
    async listRoles(orgId) {
        const resp = await this.deps.ports.transport.request({
            method: 'GET',
            url: `${this.deps.apiBaseUrl}/orgs/${encodeURIComponent(orgId)}/roles`,
        });
        await ensureOk(resp);
        return resp.body?.roles ?? [];
    }
    async getRole(orgId, roleId) {
        const resp = await this.deps.ports.transport.request({
            method: 'GET',
            url: `${this.deps.apiBaseUrl}/orgs/${encodeURIComponent(orgId)}/roles/${encodeURIComponent(roleId)}`,
        });
        await ensureOk(resp);
        return resp.body;
    }
    async createRole(orgId, body) {
        const resp = await this.deps.ports.transport.request({
            method: 'POST',
            url: `${this.deps.apiBaseUrl}/orgs/${encodeURIComponent(orgId)}/roles`,
            body,
        });
        await ensureOk(resp);
        return resp.body;
    }
    async updateRole(orgId, roleId, body) {
        const resp = await this.deps.ports.transport.request({
            method: 'PUT',
            url: `${this.deps.apiBaseUrl}/orgs/${encodeURIComponent(orgId)}/roles/${encodeURIComponent(roleId)}`,
            body,
        });
        await ensureOk(resp);
        return resp.body;
    }
    async deleteRole(orgId, roleId) {
        const resp = await this.deps.ports.transport.request({
            method: 'DELETE',
            url: `${this.deps.apiBaseUrl}/orgs/${encodeURIComponent(orgId)}/roles/${encodeURIComponent(roleId)}`,
        });
        await ensureOk(resp);
    }
    /** GET /orgs/{orgId}/permissions/assignable — for a role-editor picker. */
    async listAssignablePermissions(orgId) {
        const resp = await this.deps.ports.transport.request({
            method: 'GET',
            url: `${this.deps.apiBaseUrl}/orgs/${encodeURIComponent(orgId)}/permissions/assignable`,
        });
        await ensureOk(resp);
        return resp.body?.permissions ?? [];
    }
    /* ── Invitations: org side ────────────────────────────────────── */
    /** POST /orgs/{orgId}/invitations — invite by email. */
    async createInvitation(orgId, body) {
        const resp = await this.deps.ports.transport.request({
            method: 'POST',
            url: `${this.deps.apiBaseUrl}/orgs/${encodeURIComponent(orgId)}/invitations`,
            body,
        });
        await ensureOk(resp);
        return resp.body;
    }
    /** GET /orgs/{orgId}/invitations — list pending invitations. */
    async listInvitations(orgId) {
        const resp = await this.deps.ports.transport.request({
            method: 'GET',
            url: `${this.deps.apiBaseUrl}/orgs/${encodeURIComponent(orgId)}/invitations`,
        });
        await ensureOk(resp);
        return resp.body?.invitations ?? [];
    }
    /** DELETE /orgs/{orgId}/invitations/{id} — revoke. */
    async revokeInvitation(orgId, invitationId) {
        const resp = await this.deps.ports.transport.request({
            method: 'DELETE',
            url: `${this.deps.apiBaseUrl}/orgs/${encodeURIComponent(orgId)}/invitations/${encodeURIComponent(invitationId)}`,
        });
        await ensureOk(resp);
    }
    /* ── Invitations: invitee side ────────────────────────────────── */
    /**
     * GET /me/invitations — every pending invitation addressed to the
     * authenticated caller's email. Empty array if none.
     */
    async listMyInvitations() {
        const resp = await this.deps.ports.transport.request({
            method: 'GET',
            url: `${this.deps.apiBaseUrl}/me/invitations`,
        });
        await ensureOk(resp);
        return resp.body?.invitations ?? [];
    }
    /**
     * POST /me/invitations/{id}/accept — join the org. After success,
     * call AuthClient.switchOrg(organizationId) to scope the active
     * token to the newly-joined org.
     */
    async acceptMyInvitation(invitationId) {
        const resp = await this.deps.ports.transport.request({
            method: 'POST',
            url: `${this.deps.apiBaseUrl}/me/invitations/${encodeURIComponent(invitationId)}/accept`,
        });
        await ensureOk(resp);
        return resp.body?.organization ?? null;
    }
    /** POST /me/invitations/{id}/decline. */
    async declineMyInvitation(invitationId) {
        const resp = await this.deps.ports.transport.request({
            method: 'POST',
            url: `${this.deps.apiBaseUrl}/me/invitations/${encodeURIComponent(invitationId)}/decline`,
        });
        await ensureOk(resp);
    }
}
//# sourceMappingURL=org.flow.js.map