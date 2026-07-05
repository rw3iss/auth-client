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
import { type FlowDeps } from './flow-deps.js';
import type { Organization } from '../types.js';
import type { OrgMemberRecord, AdminUserOrgMembership, OrgRoleRecord, AssignablePermissionRecord, InvitationRecord, UpdateOrgRequest, CreateOrgRequest, CreateOrgRoleRequest, UpdateOrgRoleRequest, UpdateMemberStatusRequest, CreateInvitationRequest } from '@vendidit/auth-shared/dto';
export type { OrgMemberRecord, AdminUserOrgMembership, OrgRoleRecord, AssignablePermissionRecord, InvitationRecord, UpdateOrgRequest, CreateOrgRequest, CreateOrgRoleRequest, UpdateOrgRoleRequest, UpdateMemberStatusRequest, CreateInvitationRequest, };
export declare class OrgFlow {
    private readonly deps;
    constructor(deps: FlowDeps);
    /**
     * GET /admin/organizations — list every org. adminChain
     * (system_admin OR super_admin) on the server side. Used by
     * back-office admin UIs that need a full picker.
     */
    listAll(): Promise<Organization[]>;
    /** GET /orgs/{orgId} — read settings for an org the caller belongs to. */
    get(orgId: string): Promise<Organization>;
    /** PUT /orgs/{orgId} — update settings. Requires `org:update`. */
    update(orgId: string, body: UpdateOrgRequest): Promise<Organization>;
    /**
     * GET /admin/organizations/{orgId} — back-office read. Goes through
     * the `adminChain` + `requireSystemAdmin` path so non-members
     * (specifically platform-admin operators who never joined the org)
     * can still inspect it. The user-self equivalent is `get()` above,
     * which requires org membership.
     */
    adminGet(orgId: string): Promise<Organization>;
    /**
     * PUT /admin/organizations/{orgId} — back-office write. system_admin
     * only on the server. Accepts the broader admin field-set
     * (description, contact info, address, logo_url, …) that the
     * user-self `update()` doesn't expose.
     */
    adminUpdate(orgId: string, body: UpdateOrgRequest): Promise<Organization>;
    /**
     * GET /admin/organizations/{orgId}/members — back-office member
     * listing. Used by admin UIs that need member counts / a roster
     * for orgs the caller isn't a member of.
     */
    adminListMembers(orgId: string): Promise<OrgMemberRecord[]>;
    /**
     * GET /admin/users/{userId}/organizations — admin view of every
     * org a user belongs to, with status + roles. system_admin only.
     */
    adminGetUserOrganizations(userId: string): Promise<AdminUserOrgMembership[]>;
    /**
     * POST /admin/organizations/{orgId}/members — add an EXISTING user
     * to an org (system_admin only). Omit roleIds for the org_member
     * fallback role. For invite-by-email use createInvitation instead.
     */
    adminAddMember(orgId: string, userId: string, roleIds?: string[]): Promise<void>;
    /**
     * DELETE /admin/organizations/{orgId}/members/{userId} — remove a
     * member from any org (system_admin only; no org context needed,
     * unlike the self-service removeMember).
     */
    adminRemoveMember(orgId: string, userId: string): Promise<void>;
    /**
     * PUT /admin/organizations/{orgId}/members/{userId}/roles —
     * REPLACE a member's org-role set (set semantics: roles not
     * listed are removed; new ones assigned). Org-scoped role codes
     * only (`org_admin`, `org_manager`, `seller`, `buyer`,
     * `org_member`, or this org's custom roles) — base/platform roles
     * are rejected; manage those via `setUserRoles`. system_admin only.
     *
     * Backs "change organization admin" UIs: promote the new admin
     * with `[...current, 'org_admin']`, demote the old with their
     * roles minus `org_admin`. Returns the refreshed membership.
     */
    adminSetMemberRoles(orgId: string, userId: string, roleCodes: string[]): Promise<OrgMemberRecord>;
    /**
     * POST /admin/organizations — create a new org. Admin-only on the
     * server side; surface it through this flow for the admin CLI / UI.
     */
    create(body: CreateOrgRequest): Promise<Organization>;
    /** DELETE /admin/organizations/{orgId} — admin only. */
    deleteOrg(orgId: string): Promise<void>;
    listMembers(orgId: string): Promise<OrgMemberRecord[]>;
    removeMember(orgId: string, userId: string): Promise<void>;
    updateMemberStatus(orgId: string, userId: string, status: string): Promise<void>;
    listRoles(orgId: string): Promise<OrgRoleRecord[]>;
    getRole(orgId: string, roleId: string): Promise<OrgRoleRecord>;
    createRole(orgId: string, body: CreateOrgRoleRequest): Promise<OrgRoleRecord>;
    updateRole(orgId: string, roleId: string, body: UpdateOrgRoleRequest): Promise<OrgRoleRecord>;
    deleteRole(orgId: string, roleId: string): Promise<void>;
    /** GET /orgs/{orgId}/permissions/assignable — for a role-editor picker. */
    listAssignablePermissions(orgId: string): Promise<AssignablePermissionRecord[]>;
    /** POST /orgs/{orgId}/invitations — invite by email. */
    createInvitation(orgId: string, body: CreateInvitationRequest): Promise<InvitationRecord>;
    /** GET /orgs/{orgId}/invitations — list pending invitations. */
    listInvitations(orgId: string): Promise<InvitationRecord[]>;
    /** DELETE /orgs/{orgId}/invitations/{id} — revoke. */
    revokeInvitation(orgId: string, invitationId: string): Promise<void>;
    /**
     * GET /me/invitations — every pending invitation addressed to the
     * authenticated caller's email. Empty array if none.
     */
    listMyInvitations(): Promise<InvitationRecord[]>;
    /**
     * POST /me/invitations/{id}/accept — join the org. After success,
     * call AuthClient.switchOrg(organizationId) to scope the active
     * token to the newly-joined org.
     */
    acceptMyInvitation(invitationId: string): Promise<Organization | null>;
    /** POST /me/invitations/{id}/decline. */
    declineMyInvitation(invitationId: string): Promise<void>;
}
//# sourceMappingURL=org.flow.d.ts.map