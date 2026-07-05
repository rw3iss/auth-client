import type { InvitationRecord } from '../../../../core/flows/org.flow.js';
import type { AuthClient } from '../../../../core/auth-client.js';
/**
 * Single-invitation accept/decline card — useful for an `/accept-
 * invite/{id}` route where the user landed from an email and you want
 * a focused decision surface (vs. the multi-row `<InvitationsList>`).
 *
 * On accept, optionally switchOrg to scope the active token to the
 * newly-joined org (default true). The accepted/declined state is
 * tracked locally so the card renders a final acknowledgment after
 * the action.
 */
export interface InvitationAcceptCardProps {
    invitation: InvitationRecord;
    client?: AuthClient;
    /** Switch the active token to the new org on accept. Default true. */
    autoSwitch?: boolean;
    /** Navigation hook called after accept (e.g. router.push('/dashboard')). */
    onAccepted?: (org: {
        id: string;
        name?: string;
    }) => void;
    onDeclined?: () => void;
    className?: string;
}
export declare function InvitationAcceptCard(props: InvitationAcceptCardProps): import("preact").JSX.Element;
//# sourceMappingURL=InvitationAcceptCard.d.ts.map