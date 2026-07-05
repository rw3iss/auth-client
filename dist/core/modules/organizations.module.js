export class OrganizationsModule {
    ctx;
    constructor(ctx) {
        this.ctx = ctx;
    }
    /** GET /orgs/{orgId} — read settings. Requires `org:read`. */
    async get(orgId) {
        this.ctx.guard('getOrg');
        return this.ctx.flows.org.get(orgId);
    }
    /**
     * GET /admin/organizations — list every org. adminChain
     * (system_admin OR super_admin). For back-office UIs that need
     * a full picker (filter dropdowns, admin tables).
     */
    async list() {
        this.ctx.guard('listAllOrgs');
        return this.ctx.flows.org.listAll();
    }
    /** PUT /orgs/{orgId} — update settings. Requires `org:update`. */
    async update(orgId, body) {
        this.ctx.guard('updateOrg');
        return this.ctx.flows.org.update(orgId, body);
    }
    /** POST /admin/organizations — create. Admin only. */
    async create(body) {
        this.ctx.guard('createOrg');
        return this.ctx.flows.org.create(body);
    }
    /** DELETE /admin/organizations/{orgId}. Admin only. */
    async delete(orgId) {
        this.ctx.guard('deleteOrg');
        await this.ctx.flows.org.deleteOrg(orgId);
    }
    /** GET /admin/organizations/{orgId}. system_admin only. Use this in
     *  back-office UIs when the operator may not be a member of the org. */
    async adminGet(orgId) {
        this.ctx.guard('adminGetOrg');
        return this.ctx.flows.org.adminGet(orgId);
    }
    /** PUT /admin/organizations/{orgId}. system_admin only. */
    async adminUpdate(orgId, body) {
        this.ctx.guard('adminUpdateOrg');
        return this.ctx.flows.org.adminUpdate(orgId, body);
    }
    /** GET /orgs/{orgId}/members. Requires `org:members:read`. */
    async listMembers(orgId) {
        this.ctx.guard('listOrgMembers');
        return this.ctx.flows.org.listMembers(orgId);
    }
    /** GET /admin/organizations/{orgId}/members. system_admin only. */
    async adminListMembers(orgId) {
        this.ctx.guard('adminListOrgMembers');
        return this.ctx.flows.org.adminListMembers(orgId);
    }
    /** POST /admin/organizations/{orgId}/members — add an existing user. */
    async addMember(orgId, userId, roleIds = []) {
        this.ctx.guard('adminAddOrgMember');
        return this.ctx.flows.org.adminAddMember(orgId, userId, roleIds);
    }
    /** DELETE /orgs/{orgId}/members/{userId}. Requires `org:members:remove`. */
    async removeMember(orgId, userId) {
        this.ctx.guard('removeOrgMember');
        await this.ctx.flows.org.removeMember(orgId, userId);
    }
    /** DELETE /admin/organizations/{orgId}/members/{userId} — remove a member (admin path). */
    async adminRemoveMember(orgId, userId) {
        this.ctx.guard('adminRemoveOrgMember');
        return this.ctx.flows.org.adminRemoveMember(orgId, userId);
    }
    /** PUT /orgs/{orgId}/members/{userId}/status. Requires `org:members:update`. */
    async updateMemberStatus(orgId, userId, status) {
        this.ctx.guard('updateOrgMemberStatus');
        await this.ctx.flows.org.updateMemberStatus(orgId, userId, status);
    }
    /** PUT /admin/organizations/{orgId}/members/{userId}/roles —
     *  replace a member's org-role set (set semantics; org-scoped
     *  codes only). system_admin only. Backs org-admin reassignment. */
    async setMemberRoles(orgId, userId, roleCodes) {
        this.ctx.guard('adminSetOrgMemberRoles');
        return this.ctx.flows.org.adminSetMemberRoles(orgId, userId, roleCodes);
    }
    /** GET /orgs/{orgId}/roles. Requires `org:roles:read`. */
    async listRoles(orgId) {
        this.ctx.guard('listOrgRoles');
        return this.ctx.flows.org.listRoles(orgId);
    }
    /** GET /orgs/{orgId}/roles/{roleId}. */
    async getRole(orgId, roleId) {
        this.ctx.guard('getOrgRole');
        return this.ctx.flows.org.getRole(orgId, roleId);
    }
    /** POST /orgs/{orgId}/roles — create a custom role. */
    async createRole(orgId, body) {
        this.ctx.guard('createOrgRole');
        return this.ctx.flows.org.createRole(orgId, body);
    }
    /** PUT /orgs/{orgId}/roles/{roleId} — edit a custom role. */
    async updateRole(orgId, roleId, body) {
        this.ctx.guard('updateOrgRole');
        return this.ctx.flows.org.updateRole(orgId, roleId, body);
    }
    /** DELETE /orgs/{orgId}/roles/{roleId}. */
    async deleteRole(orgId, roleId) {
        this.ctx.guard('deleteOrgRole');
        await this.ctx.flows.org.deleteRole(orgId, roleId);
    }
    /** GET /orgs/{orgId}/permissions/assignable — for the role-editor picker. */
    async listAssignablePermissions(orgId) {
        this.ctx.guard('listAssignablePermissions');
        return this.ctx.flows.org.listAssignablePermissions(orgId);
    }
    /** POST /orgs/{orgId}/invitations — invite by email. */
    async createInvitation(orgId, body) {
        this.ctx.guard('createInvitation');
        return this.ctx.flows.org.createInvitation(orgId, body);
    }
    /** GET /orgs/{orgId}/invitations — list pending org-side. */
    async listInvitations(orgId) {
        this.ctx.guard('listOrgInvitations');
        return this.ctx.flows.org.listInvitations(orgId);
    }
    /** DELETE /orgs/{orgId}/invitations/{id} — revoke. */
    async revokeInvitation(orgId, invitationId) {
        this.ctx.guard('revokeInvitation');
        await this.ctx.flows.org.revokeInvitation(orgId, invitationId);
    }
}
//# sourceMappingURL=organizations.module.js.map