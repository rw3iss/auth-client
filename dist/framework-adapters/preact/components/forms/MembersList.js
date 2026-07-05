import { jsx as _jsx, jsxs as _jsxs } from "preact/jsx-runtime";
/** @jsxImportSource preact */
import { useEffect, useState } from 'preact/hooks';
import { useListOrgMembers, useRemoveOrgMember } from '../../actions.js';
import { useOrg } from '../../hooks.js';
export function MembersList(props) {
    const org = useOrg(props.client);
    const list = useListOrgMembers(props.client);
    const remove = useRemoveOrgMember(props.client);
    const [items, setItems] = useState([]);
    const orgId = props.orgId ?? org?.id;
    useEffect(() => {
        if (!orgId)
            return;
        void list.run(orgId).then(setItems);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [orgId]);
    if (!orgId) {
        return _jsx("div", { class: "vauth-members-empty", children: "No active organization." });
    }
    if (list.loading && items.length === 0) {
        return _jsx("div", { class: "vauth-members-loading", children: "Loading members\u2026" });
    }
    if (list.error) {
        return _jsx("div", { class: "vauth-error", role: "alert", children: list.error.message });
    }
    const onRemove = async (userId) => {
        await remove.run({ orgId, userId });
        setItems((prev) => prev.filter((m) => m.user_id !== userId));
    };
    return (_jsxs("table", { class: `vauth-members-table ${props.className ?? ''}`, children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Member" }), _jsx("th", { children: "Roles" }), _jsx("th", { children: "Status" }), _jsx("th", {})] }) }), _jsx("tbody", { children: items.map((m) => (_jsxs("tr", { children: [_jsxs("td", { children: [_jsx("div", { children: m.display_name ?? (`${m.first_name ?? ''} ${m.last_name ?? ''}`.trim() || m.email || m.user_id) }), m.email && _jsx("div", { class: "vauth-members-email", children: m.email })] }), _jsx("td", { children: (m.roles ?? []).map((r) => _jsx("span", { class: "vauth-tag", children: r.code }, r.id)) }), _jsx("td", { children: m.status ?? '—' }), _jsx("td", { children: _jsx("button", { type: "button", class: "vauth-btn vauth-btn-danger vauth-btn-sm", onClick: () => onRemove(m.user_id), disabled: remove.loading, children: "Remove" }) })] }, m.id))) })] }));
}
//# sourceMappingURL=MembersList.js.map