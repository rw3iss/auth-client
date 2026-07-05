/** @jsxImportSource preact */
import { useEffect, useState } from 'preact/hooks';
import { useListMyInvitations, useAcceptInvitation, useDeclineInvitation, useSwitchOrg } from '../../actions.js';
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

export function InvitationsList(props: InvitationsListProps) {
    const list = useListMyInvitations(props.client);
    const accept = useAcceptInvitation(props.client);
    const decline = useDeclineInvitation(props.client);
    const switchOrg = useSwitchOrg(props.client);
    const [items, setItems] = useState<InvitationRecord[]>([]);

    useEffect(() => {
        void list.run().then(setItems);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onAccept = async (inv: InvitationRecord) => {
        await accept.run(inv.id);
        if (props.autoSwitch !== false) {
            try {
                await switchOrg.run(inv.organization_id);
            } catch {
                // The accept succeeded — the switch is best-effort. If the
                // newly-granted membership isn't immediately readable for
                // a stale moment, the next refresh picks it up.
            }
        }
        setItems((prev) => prev.filter((i) => i.id !== inv.id));
        props.onAccepted?.(inv);
    };

    const onDecline = async (inv: InvitationRecord) => {
        await decline.run(inv.id);
        setItems((prev) => prev.filter((i) => i.id !== inv.id));
        props.onDeclined?.(inv);
    };

    if (list.loading && items.length === 0) return <div class="vauth-form-loading">Loading invitations…</div>;
    if (list.error) return <div class="vauth-error" role="alert">{list.error.message}</div>;
    if (items.length === 0) return <div class="vauth-invitations-empty">No pending invitations.</div>;

    return (
        <ul class={`vauth-invitations-list ${props.className ?? ''}`}>
            {items.map((inv) => (
                <li key={inv.id} class="vauth-invitation-card">
                    <div class="vauth-invitation-body">
                        <div class="vauth-invitation-title">
                            {inv.organization?.name ?? inv.organization_id}
                        </div>
                        <div class="vauth-invitation-meta">
                            Invited by {inv.invited_by_user?.email ?? inv.invited_by}
                        </div>
                    </div>
                    <div class="vauth-invitation-actions">
                        <button
                            type="button"
                            class="vauth-btn vauth-btn-primary vauth-btn-sm"
                            onClick={() => onAccept(inv)}
                            disabled={accept.loading}
                        >
                            Accept
                        </button>
                        <button
                            type="button"
                            class="vauth-btn vauth-btn-ghost vauth-btn-sm"
                            onClick={() => onDecline(inv)}
                            disabled={decline.loading}
                        >
                            Decline
                        </button>
                    </div>
                </li>
            ))}
        </ul>
    );
}
