import type { AuthClient } from '../../../../core/auth-client.js';
/**
 * One-page org administration surface. Composes:
 *   - OrgSettingsForm (name / slug)
 *   - InviteMemberForm + InvitationsAdminList (pending invites)
 *   - MembersList (current members)
 *   - OrgRoleEditor (custom roles + permission picker)
 *
 * Use under /settings/organization. Requires the caller's active
 * org context — read from `useOrg()` — and the relevant `org:*`
 * permissions for each section (each child gates server-side).
 *
 * Invite + pending-list are wired so a successful invite re-fetches
 * the pending list automatically (via the `refreshKey` prop on
 * InvitationsAdminList).
 */
export interface CompleteOrgAdminFlowProps {
    client?: AuthClient;
    orgId?: string;
    className?: string;
}
export declare function CompleteOrgAdminFlow(props: CompleteOrgAdminFlowProps): import("preact").JSX.Element;
//# sourceMappingURL=CompleteOrgAdminFlow.d.ts.map