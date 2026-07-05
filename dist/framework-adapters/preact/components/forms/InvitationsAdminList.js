import { jsx as _jsx, jsxs as _jsxs } from "preact/jsx-runtime";
/** @jsxImportSource preact */
import { useEffect, useState } from 'preact/hooks';
import { useListOrgInvitations, useRevokeInvitation } from '../../actions.js';
import { useOrg } from '../../hooks.js';
export function InvitationsAdminList(props) {
    const org = useOrg(props.client);
    const list = useListOrgInvitations(props.client);
    const revoke = useRevokeInvitation(props.client);
    const [items, setItems] = useState([]);
    const orgId = props.orgId ?? org?.id;
    useEffect(() => {
        if (!orgId)
            return;
        void list.run(orgId).then(setItems);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [orgId, props.refreshKey]);
    if (!orgId)
        return null;
    if (list.loading && items.length === 0)
        return _jsx("div", { class: "vauth-form-loading", children: "Loading invitations\u2026" });
    if (items.length === 0)
        return _jsx("div", { class: "vauth-invitations-empty", children: "No pending invitations." });
    const onRevoke = async (id) => {
        await revoke.run({ orgId, invitationId: id });
        setItems((prev) => prev.filter((i) => i.id !== id));
    };
    const fmt = (sec) => sec ? new Date(sec * 1000).toLocaleDateString() : '—';
    return (_jsxs("table", { class: `vauth-invitations-admin-table ${props.className ?? ''}`, children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Email" }), _jsx("th", { children: "Status" }), _jsx("th", { children: "Expires" }), _jsx("th", {})] }) }), _jsx("tbody", { children: items.map((inv) => (_jsxs("tr", { children: [_jsx("td", { children: inv.email }), _jsx("td", { children: _jsx("span", { class: "vauth-tag", children: inv.status }) }), _jsx("td", { children: fmt(inv.expires_at) }), _jsx("td", { children: _jsx("button", { type: "button", class: "vauth-btn vauth-btn-ghost vauth-btn-sm", onClick: () => onRevoke(inv.id), disabled: revoke.loading || inv.status !== 'pending', children: "Revoke" }) })] }, inv.id))) })] }));
}
//# sourceMappingURL=InvitationsAdminList.js.map