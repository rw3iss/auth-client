/**
 * `client.organizations` — org CRUD, membership, custom roles and the
 * invitation lifecycle. Methods cover BOTH surfaces; the server gates
 * each route:
 *   - self-service (`/orgs/{orgId}/*`) — requires org membership +
 *     the per-action `org:*` permission;
 *   - back-office (`/admin/organizations/*`, `admin*` methods here) —
 *     system_admin / super_admin, no org membership needed.
 */
import type { ModuleContext } from '../module-context.js';
import type { Organization } from '../types.js';
import type {
    OrgMemberRecord,
    OrgRoleRecord,
    AssignablePermissionRecord,
    InvitationRecord,
    UpdateOrgRequest,
    CreateOrgRequest,
    CreateOrgRoleRequest,
    UpdateOrgRoleRequest,
    CreateInvitationRequest,
} from '../flows/org.flow.js';

export class OrganizationsModule {
    constructor(private readonly ctx: ModuleContext) {}

    /** GET /orgs/{orgId} — read settings. Requires `org:read`. */
    async get(orgId: string): Promise<Organization> {
        this.ctx.guard('getOrg');
        return this.ctx.flows.org.get(orgId);
    }

    /**
     * GET /admin/organizations — list every org. adminChain
     * (system_admin OR super_admin). For back-office UIs that need
     * a full picker (filter dropdowns, admin tables).
     */
    async list(): Promise<Organization[]> {
        this.ctx.guard('listAllOrgs');
        return this.ctx.flows.org.listAll();
    }

    /** PUT /orgs/{orgId} — update settings. Requires `org:update`. */
    async update(orgId: string, body: UpdateOrgRequest): Promise<Organization> {
        this.ctx.guard('updateOrg');
        return this.ctx.flows.org.update(orgId, body);
    }

    /** POST /admin/organizations — create. Admin only. */
    async create(body: CreateOrgRequest): Promise<Organization> {
        this.ctx.guard('createOrg');
        return this.ctx.flows.org.create(body);
    }

    /** DELETE /admin/organizations/{orgId}. Admin only. */
    async delete(orgId: string): Promise<void> {
        this.ctx.guard('deleteOrg');
        await this.ctx.flows.org.deleteOrg(orgId);
    }

    /** GET /admin/organizations/{orgId}. system_admin only. Use this in
     *  back-office UIs when the operator may not be a member of the org. */
    async adminGet(orgId: string): Promise<Organization> {
        this.ctx.guard('adminGetOrg');
        return this.ctx.flows.org.adminGet(orgId);
    }

    /** PUT /admin/organizations/{orgId}. system_admin only. */
    async adminUpdate(orgId: string, body: UpdateOrgRequest): Promise<Organization> {
        this.ctx.guard('adminUpdateOrg');
        return this.ctx.flows.org.adminUpdate(orgId, body);
    }

    /** GET /orgs/{orgId}/members. Requires `org:members:read`. */
    async listMembers(orgId: string): Promise<OrgMemberRecord[]> {
        this.ctx.guard('listOrgMembers');
        return this.ctx.flows.org.listMembers(orgId);
    }

    /** GET /admin/organizations/{orgId}/members. system_admin only. */
    async adminListMembers(orgId: string): Promise<OrgMemberRecord[]> {
        this.ctx.guard('adminListOrgMembers');
        return this.ctx.flows.org.adminListMembers(orgId);
    }

    /** POST /admin/organizations/{orgId}/members — add an existing user. */
    async addMember(orgId: string, userId: string, roleIds: string[] = []): Promise<void> {
        this.ctx.guard('adminAddOrgMember');
        return this.ctx.flows.org.adminAddMember(orgId, userId, roleIds);
    }

    /** DELETE /orgs/{orgId}/members/{userId}. Requires `org:members:remove`. */
    async removeMember(orgId: string, userId: string): Promise<void> {
        this.ctx.guard('removeOrgMember');
        await this.ctx.flows.org.removeMember(orgId, userId);
    }

    /** DELETE /admin/organizations/{orgId}/members/{userId} — remove a member (admin path). */
    async adminRemoveMember(orgId: string, userId: string): Promise<void> {
        this.ctx.guard('adminRemoveOrgMember');
        return this.ctx.flows.org.adminRemoveMember(orgId, userId);
    }

    /** PUT /orgs/{orgId}/members/{userId}/status. Requires `org:members:update`. */
    async updateMemberStatus(orgId: string, userId: string, status: string): Promise<void> {
        this.ctx.guard('updateOrgMemberStatus');
        await this.ctx.flows.org.updateMemberStatus(orgId, userId, status);
    }

    /** PUT /admin/organizations/{orgId}/members/{userId}/roles —
     *  replace a member's org-role set (set semantics; org-scoped
     *  codes only). system_admin only. Backs org-admin reassignment. */
    async setMemberRoles(orgId: string, userId: string, roleCodes: string[]): Promise<OrgMemberRecord> {
        this.ctx.guard('adminSetOrgMemberRoles');
        return this.ctx.flows.org.adminSetMemberRoles(orgId, userId, roleCodes);
    }

    /** GET /orgs/{orgId}/roles. Requires `org:roles:read`. */
    async listRoles(orgId: string): Promise<OrgRoleRecord[]> {
        this.ctx.guard('listOrgRoles');
        return this.ctx.flows.org.listRoles(orgId);
    }

    /** GET /orgs/{orgId}/roles/{roleId}. */
    async getRole(orgId: string, roleId: string): Promise<OrgRoleRecord> {
        this.ctx.guard('getOrgRole');
        return this.ctx.flows.org.getRole(orgId, roleId);
    }

    /** POST /orgs/{orgId}/roles — create a custom role. */
    async createRole(orgId: string, body: CreateOrgRoleRequest): Promise<OrgRoleRecord> {
        this.ctx.guard('createOrgRole');
        return this.ctx.flows.org.createRole(orgId, body);
    }

    /** PUT /orgs/{orgId}/roles/{roleId} — edit a custom role. */
    async updateRole(orgId: string, roleId: string, body: UpdateOrgRoleRequest): Promise<OrgRoleRecord> {
        this.ctx.guard('updateOrgRole');
        return this.ctx.flows.org.updateRole(orgId, roleId, body);
    }

    /** DELETE /orgs/{orgId}/roles/{roleId}. */
    async deleteRole(orgId: string, roleId: string): Promise<void> {
        this.ctx.guard('deleteOrgRole');
        await this.ctx.flows.org.deleteRole(orgId, roleId);
    }

    /** GET /orgs/{orgId}/permissions/assignable — for the role-editor picker. */
    async listAssignablePermissions(orgId: string): Promise<AssignablePermissionRecord[]> {
        this.ctx.guard('listAssignablePermissions');
        return this.ctx.flows.org.listAssignablePermissions(orgId);
    }

    /** POST /orgs/{orgId}/invitations — invite by email. */
    async createInvitation(orgId: string, body: CreateInvitationRequest): Promise<InvitationRecord> {
        this.ctx.guard('createInvitation');
        return this.ctx.flows.org.createInvitation(orgId, body);
    }

    /** GET /orgs/{orgId}/invitations — list pending org-side. */
    async listInvitations(orgId: string): Promise<InvitationRecord[]> {
        this.ctx.guard('listOrgInvitations');
        return this.ctx.flows.org.listInvitations(orgId);
    }

    /** DELETE /orgs/{orgId}/invitations/{id} — revoke. */
    async revokeInvitation(orgId: string, invitationId: string): Promise<void> {
        this.ctx.guard('revokeInvitation');
        await this.ctx.flows.org.revokeInvitation(orgId, invitationId);
    }
}
