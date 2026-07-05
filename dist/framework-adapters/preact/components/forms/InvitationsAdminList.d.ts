import type { AuthClient } from '../../../../core/auth-client.js';
/**
 * Org-side pending-invitations table. One row per outstanding invite
 * with a "revoke" affordance. Pairs with `<InviteMemberForm>` on the
 * org admin page — invite up top, see the pending list below.
 *
 * Distinguished from `<InvitationsList>` which is the invitee-side
 * (current user's pending invites) version.
 */
export interface InvitationsAdminListProps {
    client?: AuthClient;
    orgId?: string;
    className?: string;
    /** Triggers a re-fetch when this value changes — bump it from a
     * parent after `InviteMemberForm.onCreated` to refresh the list. */
    refreshKey?: number | string;
}
export declare function InvitationsAdminList(props: InvitationsAdminListProps): import("preact").JSX.Element | null;
//# sourceMappingURL=InvitationsAdminList.d.ts.map