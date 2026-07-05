import type { InvitationRecord } from '../../../../core/flows/org.flow.js';
import type { AuthClient } from '../../../../core/auth-client.js';
/**
 * The authenticated invitee's pending invitations. Shows one row per
 * pending invitation with "Accept" / "Decline" affordances.
 *
 * On accept:
 *   - The server creates the org_member row + assigns roles.
 *   - This component optionally calls `switchOrg(orgId)` so the
 *     active token re-scopes to the new org immediately.
 *     Disable via `autoSwitch={false}` if your app prefers to keep
 *     the user in their current org and surface a "switch to NewOrg"
 *     toast instead.
 *
 * Distinguished from `<MembersList>` (which is org-side, for admins)
 * and `<InvitationsAdminList>` (also org-side; below).
 */
export interface InvitationsListProps {
    client?: AuthClient;
    /** Whether to switchOrg on accept. Default true. */
    autoSwitch?: boolean;
    onAccepted?: (invitation: InvitationRecord) => void;
    onDeclined?: (invitation: InvitationRecord) => void;
    className?: string;
}
export declare function InvitationsList(props: InvitationsListProps): import("preact").JSX.Element;
//# sourceMappingURL=InvitationsList.d.ts.map