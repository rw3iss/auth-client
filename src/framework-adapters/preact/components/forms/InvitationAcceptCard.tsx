/** @jsxImportSource preact */
import { useState } from 'preact/hooks';
import { useAcceptInvitation, useDeclineInvitation, useSwitchOrg } from '../../actions.js';
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
    onAccepted?: (org: { id: string; name?: string }) => void;
    onDeclined?: () => void;
    className?: string;
}

export function InvitationAcceptCard(props: InvitationAcceptCardProps) {
    const accept = useAcceptInvitation(props.client);
    const decline = useDeclineInvitation(props.client);
    const switchOrg = useSwitchOrg(props.client);
    const [resolution, setResolution] = useState<'accepted' | 'declined' | null>(null);

    const orgName = props.invitation.organization?.name ?? props.invitation.organization_id;

    const onAccept = async () => {
        await accept.run(props.invitation.id);
        if (props.autoSwitch !== false) {
            try { await switchOrg.run(props.invitation.organization_id); } catch { /* best-effort */ }
        }
        setResolution('accepted');
        props.onAccepted?.({ id: props.invitation.organization_id, ...(props.invitation.organization?.name && { name: props.invitation.organization.name }) });
    };
    const onDecline = async () => {
        await decline.run(props.invitation.id);
        setResolution('declined');
        props.onDeclined?.();
    };

    if (resolution === 'accepted') {
        return (
            <div class={`vauth-invitation-accept-card vauth-form-success ${props.className ?? ''}`} role="status">
                You've joined <strong>{orgName}</strong>.
            </div>
        );
    }
    if (resolution === 'declined') {
        return (
            <div class={`vauth-invitation-accept-card ${props.className ?? ''}`} role="status">
                Invitation declined.
            </div>
        );
    }

    return (
        <div class={`vauth-invitation-accept-card ${props.className ?? ''}`}>
            <h3 class="vauth-invitation-accept-title">You've been invited</h3>
            <p class="vauth-invitation-accept-text">
                Join <strong>{orgName}</strong>{' '}
                {props.invitation.invited_by_user?.email && (
                    <>· invited by {props.invitation.invited_by_user.email}</>
                )}
            </p>
            {(accept.error || decline.error) && (
                <div class="vauth-error" role="alert">
                    {(accept.error ?? decline.error)?.message}
                </div>
            )}
            <div class="vauth-form-actions">
                <button
                    type="button"
                    class="vauth-btn vauth-btn-primary"
                    onClick={onAccept}
                    disabled={accept.loading}
                    aria-busy={accept.loading}
                >
                    {accept.loading ? 'Joining…' : `Join ${orgName}`}
                </button>
                <button
                    type="button"
                    class="vauth-btn vauth-btn-ghost"
                    onClick={onDecline}
                    disabled={decline.loading}
                >
                    Decline
                </button>
            </div>
        </div>
    );
}
