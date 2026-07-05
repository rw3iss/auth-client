/** @jsxImportSource preact */
import { useEffect, useState } from 'preact/hooks';
import { useListOrgInvitations, useRevokeInvitation } from '../../actions.js';
import { useOrg } from '../../hooks.js';
import type { InvitationRecord } from '../../../../core/flows/org.flow.js';
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

export function InvitationsAdminList(props: InvitationsAdminListProps) {
    const org = useOrg(props.client);
    const list = useListOrgInvitations(props.client);
    const revoke = useRevokeInvitation(props.client);
    const [items, setItems] = useState<InvitationRecord[]>([]);
    const orgId = props.orgId ?? org?.id;

    useEffect(() => {
        if (!orgId) return;
        void list.run(orgId).then(setItems);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [orgId, props.refreshKey]);

    if (!orgId) return null;
    if (list.loading && items.length === 0) return <div class="vauth-form-loading">Loading invitations…</div>;
    if (items.length === 0) return <div class="vauth-invitations-empty">No pending invitations.</div>;

    const onRevoke = async (id: string) => {
        await revoke.run({ orgId, invitationId: id });
        setItems((prev) => prev.filter((i) => i.id !== id));
    };

    const fmt = (sec: number | undefined) => sec ? new Date(sec * 1000).toLocaleDateString() : '—';
    return (
        <table class={`vauth-invitations-admin-table ${props.className ?? ''}`}>
            <thead>
                <tr><th>Email</th><th>Status</th><th>Expires</th><th /></tr>
            </thead>
            <tbody>
                {items.map((inv) => (
                    <tr key={inv.id}>
                        <td>{inv.email}</td>
                        <td><span class="vauth-tag">{inv.status}</span></td>
                        <td>{fmt(inv.expires_at)}</td>
                        <td>
                            <button
                                type="button"
                                class="vauth-btn vauth-btn-ghost vauth-btn-sm"
                                onClick={() => onRevoke(inv.id)}
                                disabled={revoke.loading || inv.status !== 'pending'}
                            >
                                Revoke
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
