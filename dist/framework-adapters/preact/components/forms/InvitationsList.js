import { jsx as _jsx, jsxs as _jsxs } from "preact/jsx-runtime";
/** @jsxImportSource preact */
import { useEffect, useState } from 'preact/hooks';
import { useListMyInvitations, useAcceptInvitation, useDeclineInvitation, useSwitchOrg } from '../../actions.js';
export function InvitationsList(props) {
    const list = useListMyInvitations(props.client);
    const accept = useAcceptInvitation(props.client);
    const decline = useDeclineInvitation(props.client);
    const switchOrg = useSwitchOrg(props.client);
    const [items, setItems] = useState([]);
    useEffect(() => {
        void list.run().then(setItems);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const onAccept = async (inv) => {
        await accept.run(inv.id);
        if (props.autoSwitch !== false) {
            try {
                await switchOrg.run(inv.organization_id);
            }
            catch {
                // The accept succeeded — the switch is best-effort. If the
                // newly-granted membership isn't immediately readable for
                // a stale moment, the next refresh picks it up.
            }
        }
        setItems((prev) => prev.filter((i) => i.id !== inv.id));
        props.onAccepted?.(inv);
    };
    const onDecline = async (inv) => {
        await decline.run(inv.id);
        setItems((prev) => prev.filter((i) => i.id !== inv.id));
        props.onDeclined?.(inv);
    };
    if (list.loading && items.length === 0)
        return _jsx("div", { class: "vauth-form-loading", children: "Loading invitations\u2026" });
    if (list.error)
        return _jsx("div", { class: "vauth-error", role: "alert", children: list.error.message });
    if (items.length === 0)
        return _jsx("div", { class: "vauth-invitations-empty", children: "No pending invitations." });
    return (_jsx("ul", { class: `vauth-invitations-list ${props.className ?? ''}`, children: items.map((inv) => (_jsxs("li", { class: "vauth-invitation-card", children: [_jsxs("div", { class: "vauth-invitation-body", children: [_jsx("div", { class: "vauth-invitation-title", children: inv.organization?.name ?? inv.organization_id }), _jsxs("div", { class: "vauth-invitation-meta", children: ["Invited by ", inv.invited_by_user?.email ?? inv.invited_by] })] }), _jsxs("div", { class: "vauth-invitation-actions", children: [_jsx("button", { type: "button", class: "vauth-btn vauth-btn-primary vauth-btn-sm", onClick: () => onAccept(inv), disabled: accept.loading, children: "Accept" }), _jsx("button", { type: "button", class: "vauth-btn vauth-btn-ghost vauth-btn-sm", onClick: () => onDecline(inv), disabled: decline.loading, children: "Decline" })] })] }, inv.id))) }));
}
//# sourceMappingURL=InvitationsList.js.map