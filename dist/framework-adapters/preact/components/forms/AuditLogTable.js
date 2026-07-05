import { jsx as _jsx, jsxs as _jsxs } from "preact/jsx-runtime";
/** @jsxImportSource preact */
import { useEffect, useState } from 'preact/hooks';
import { useListAuditLog } from '../../actions.js';
export function AuditLogTable(props) {
    const list = useListAuditLog(props.client);
    const [items, setItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(props.defaultQuery?.page ?? 1);
    const [actionFilter, setActionFilter] = useState(props.defaultQuery?.action ?? '');
    const [userFilter, setUserFilter] = useState(props.defaultQuery?.userId ?? '');
    const [debouncedAction, setDebouncedAction] = useState(actionFilter);
    const [debouncedUser, setDebouncedUser] = useState(userFilter);
    const pageSize = props.pageSize ?? props.defaultQuery?.pageSize ?? 50;
    useEffect(() => {
        const t = setTimeout(() => {
            setDebouncedAction(actionFilter);
            setDebouncedUser(userFilter);
        }, 300);
        return () => clearTimeout(t);
    }, [actionFilter, userFilter]);
    useEffect(() => {
        const q = { page, pageSize };
        if (debouncedAction.trim())
            q.action = debouncedAction.trim();
        if (debouncedUser.trim())
            q.userId = debouncedUser.trim();
        void list.run(q).then((result) => {
            setItems(result.entries ?? []);
            setTotal(result.total ?? 0);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, debouncedAction, debouncedUser, pageSize]);
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    return (_jsxs("div", { class: `vauth-audit-table ${props.className ?? ''}`, children: [_jsxs("header", { class: "vauth-audit-table-header", children: [_jsx("input", { class: "vauth-input", type: "search", placeholder: 'Action: login.success or login.*', value: actionFilter, onInput: (e) => { setActionFilter(e.target.value); setPage(1); } }), _jsx("input", { class: "vauth-input", type: "search", placeholder: "User id", value: userFilter, onInput: (e) => { setUserFilter(e.target.value); setPage(1); } }), _jsxs("span", { class: "vauth-audit-table-count", children: [total, " events"] })] }), list.error && _jsx("div", { class: "vauth-error", role: "alert", children: list.error.message }), _jsxs("table", { children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "At" }), _jsx("th", { children: "Action" }), _jsx("th", { children: "Actor" }), _jsx("th", { children: "Subject" }), _jsx("th", { children: "Details" })] }) }), _jsxs("tbody", { children: [items.map((e) => (_jsxs("tr", { children: [_jsx("td", { children: _jsx("time", { children: new Date(e.created_at).toLocaleString() }) }), _jsx("td", { children: _jsx("code", { children: e.action }) }), _jsx("td", { children: shortId(e.user_id) }), _jsx("td", { children: shortId(e.details?.subject_user_id ?? undefined) }), _jsx("td", { children: _jsx("pre", { class: "vauth-audit-details", children: summarizeDetails(e.details) }) })] }, e.id))), items.length === 0 && !list.loading && (_jsx("tr", { children: _jsx("td", { colSpan: 5, class: "vauth-audit-empty", children: "No events match these filters." }) }))] })] }), totalPages > 1 && (_jsxs("footer", { class: "vauth-audit-table-footer", children: [_jsx("button", { type: "button", class: "vauth-btn vauth-btn-ghost vauth-btn-sm", onClick: () => setPage((p) => Math.max(1, p - 1)), disabled: page <= 1 || list.loading, children: "Previous" }), _jsxs("span", { children: ["Page ", page, " of ", totalPages] }), _jsx("button", { type: "button", class: "vauth-btn vauth-btn-ghost vauth-btn-sm", onClick: () => setPage((p) => Math.min(totalPages, p + 1)), disabled: page >= totalPages || list.loading, children: "Next" })] }))] }));
}
function shortId(id) {
    if (!id)
        return '—';
    return id.slice(0, 8) + '…';
}
function summarizeDetails(d) {
    if (!d)
        return '';
    const pairs = Object.entries(d)
        .filter(([k]) => k !== 'subject_user_id') // already shown as a column
        .map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : String(v)}`);
    return pairs.join('\n');
}
//# sourceMappingURL=AuditLogTable.js.map