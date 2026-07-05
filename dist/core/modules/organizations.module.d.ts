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
import type { OrgMemberRecord, OrgRoleRecord, AssignablePermissionRecord, InvitationRecord, UpdateOrgRequest, CreateOrgRequest, CreateOrgRoleRequest, UpdateOrgRoleRequest, CreateInvitationRequest } from '../flows/org.flow.js';
export declare class OrganizationsModule {
    private readonly ctx;
    constructor(ctx: ModuleContext);
    /** GET /orgs/{orgId} — read settings. Requires `org:read`. */
    get(orgId: string): Promise<Organization>;
    /**
     * GET /admin/organizations — list every org. adminChain
     * (system_admin OR super_admin). For back-office UIs that need
     * a full picker (filter dropdowns, admin tables).
     */
    list(): Promise<Organization[]>;
    /** PUT /orgs/{orgId} — update settings. Requires `org:update`. */
    update(orgId: string, body: UpdateOrgRequest): Promise<Organization>;
    /** POST /admin/organizations — create. Admin only. */
    create(body: CreateOrgRequest): Promise<Organization>;
    /** DELETE /admin/organizations/{orgId}. Admin only. */
    delete(orgId: string): Promise<void>;
    /** GET /admin/organizations/{orgId}. system_admin only. Use this in
     *  back-office UIs when the operator may not be a member of the org. */
    adminGet(orgId: string): Promise<Organization>;
    /** PUT /admin/organizations/{orgId}. system_admin only. */
    adminUpdate(orgId: string, body: UpdateOrgRequest): Promise<Organization>;
    /** GET /orgs/{orgId}/members. Requires `org:members:read`. */
    listMembers(orgId: string): Promise<OrgMemberRecord[]>;
    /** GET /admin/organizations/{orgId}/members. system_admin only. */
    adminListMembers(orgId: string): Promise<OrgMemberRecord[]>;
    /** POST /admin/organizations/{orgId}/members — add an existing user. */
    addMember(orgId: string, userId: string, roleIds?: string[]): Promise<void>;
    /** DELETE /orgs/{orgId}/members/{userId}. Requires `org:members:remove`. */
    removeMember(orgId: string, userId: string): Promise<void>;
    /** DELETE /admin/organizations/{orgId}/members/{userId} — remove a member (admin path). */
    adminRemoveMember(orgId: string, userId: string): Promise<void>;
    /** PUT /orgs/{orgId}/members/{userId}/status. Requires `org:members:update`. */
    updateMemberStatus(orgId: string, userId: string, status: string): Promise<void>;
    /** PUT /admin/organizations/{orgId}/members/{userId}/roles —
     *  replace a member's org-role set (set semantics; org-scoped
     *  codes only). system_admin only. Backs org-admin reassignment. */
    setMemberRoles(orgId: string, userId: string, roleCodes: string[]): Promise<OrgMemberRecord>;
    /** GET /orgs/{orgId}/roles. Requires `org:roles:read`. */
    listRoles(orgId: string): Promise<OrgRoleRecord[]>;
    /** GET /orgs/{orgId}/roles/{roleId}. */
    getRole(orgId: string, roleId: string): Promise<OrgRoleRecord>;
    /** POST /orgs/{orgId}/roles — create a custom role. */
    createRole(orgId: string, body: CreateOrgRoleRequest): Promise<OrgRoleRecord>;
    /** PUT /orgs/{orgId}/roles/{roleId} — edit a custom role. */
    updateRole(orgId: string, roleId: string, body: UpdateOrgRoleRequest): Promise<OrgRoleRecord>;
    /** DELETE /orgs/{orgId}/roles/{roleId}. */
    deleteRole(orgId: string, roleId: string): Promise<void>;
    /** GET /orgs/{orgId}/permissions/assignable — for the role-editor picker. */
    listAssignablePermissions(orgId: string): Promise<AssignablePermissionRecord[]>;
    /** POST /orgs/{orgId}/invitations — invite by email. */
    createInvitation(orgId: string, body: CreateInvitationRequest): Promise<InvitationRecord>;
    /** GET /orgs/{orgId}/invitations — list pending org-side. */
    listInvitations(orgId: string): Promise<InvitationRecord[]>;
    /** DELETE /orgs/{orgId}/invitations/{id} — revoke. */
    revokeInvitation(orgId: string, invitationId: string): Promise<void>;
}
//# sourceMappingURL=organizations.module.d.ts.map