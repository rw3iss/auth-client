/** @jsxImportSource preact */
import { useEffect, useState } from 'preact/hooks';
import { useListOrgMembers, useRemoveOrgMember } from '../../actions.js';
import { useOrg } from '../../hooks.js';
import type { OrgMemberRecord } from '../../../../core/flows/org.flow.js';
import type { AuthClient } from '../../../../core/auth-client.js';

/**
 * Org members table — list everyone in the current (or specified) org
 * with a "remove" affordance per row. Reads `useOrg()` for the active
 * org id by default; pass `orgId` to target a different org the
 * caller administers.
 *
 * Requires `org:members:read` (list) and `org:members:remove` (remove)
 * — the server-side gate is the source of truth. The remove button
 * surfaces server 403s as inline errors.
 */
export interface MembersListProps {
    client?: AuthClient;
    /** Defaults to the current org from the auth snapshot. */
    orgId?: string;
    className?: string;
}

export function MembersList(props: MembersListProps) {
    const org = useOrg(props.client);
    const list = useListOrgMembers(props.client);
    const remove = useRemoveOrgMember(props.client);
    const [items, setItems] = useState<OrgMemberRecord[]>([]);
    const orgId = props.orgId ?? org?.id;

    useEffect(() => {
        if (!orgId) return;
        void list.run(orgId).then(setItems);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [orgId]);

    if (!orgId) {
        return <div class="vauth-members-empty">No active organization.</div>;
    }
    if (list.loading && items.length === 0) {
        return <div class="vauth-members-loading">Loading members…</div>;
    }
    if (list.error) {
        return <div class="vauth-error" role="alert">{list.error.message}</div>;
    }

    const onRemove = async (userId: string) => {
        await remove.run({ orgId, userId });
        setItems((prev) => prev.filter((m) => m.user_id !== userId));
    };

    return (
        <table class={`vauth-members-table ${props.className ?? ''}`}>
            <thead>
                <tr><th>Member</th><th>Roles</th><th>Status</th><th /></tr>
            </thead>
            <tbody>
                {items.map((m) => (
                    <tr key={m.id}>
                        <td>
                            <div>{m.display_name ?? (`${m.first_name ?? ''} ${m.last_name ?? ''}`.trim() || m.email || m.user_id)}</div>
                            {m.email && <div class="vauth-members-email">{m.email}</div>}
                        </td>
                        <td>
                            {(m.roles ?? []).map((r) => <span key={r.id} class="vauth-tag">{r.code}</span>)}
                        </td>
                        <td>{m.status ?? '—'}</td>
                        <td>
                            <button
                                type="button"
                                class="vauth-btn vauth-btn-danger vauth-btn-sm"
                                onClick={() => onRemove(m.user_id)}
                                disabled={remove.loading}
                            >
                                Remove
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
