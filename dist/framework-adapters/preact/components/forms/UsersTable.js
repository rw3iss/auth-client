import { jsx as _jsx, jsxs as _jsxs } from "preact/jsx-runtime";
import { useEffect, useState } from 'preact/hooks';
import { useListUsers } from '../../actions.js';
import { UserAvatar } from '../atoms/UserAvatar.js';
import { roleLabels } from '@rw3iss/auth-shared/constants';
export function UsersTable(props) {
    const list = useListUsers(props.client);
    const [items, setItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const pageSize = props.pageSize ?? 25;
    // Debounce the search box. Tied to the input's value but applied
    // after 300ms of inactivity — cheap and avoids one request per keystroke.
    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search), 300);
        return () => clearTimeout(t);
    }, [search]);
    // Reset to page 1 whenever a filter changes — page numbers from
    // the previous filter would be off-by-many.
    useEffect(() => {
        setPage(1);
    }, [props.organizationId, props.appId]);
    useEffect(() => {
        const req = { page, pageSize };
        if (debouncedSearch.trim())
            req.search = debouncedSearch.trim();
        if (props.organizationId)
            req.organizationId = props.organizationId;
        if (props.appId)
            req.appId = props.appId;
        void list.run(req).then((result) => {
            setItems(result.users ?? []);
            setTotal(result.total ?? 0);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, debouncedSearch, pageSize, props.organizationId, props.appId]);
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    return (_jsxs("div", { class: `vauth-users-table ${props.className ?? ''}`, children: [_jsxs("header", { class: "vauth-users-table-header", children: [_jsx("input", { class: "vauth-input vauth-users-table-search", type: "search", placeholder: "Search by email or name\u2026", value: search, onInput: (e) => { setSearch(e.target.value); setPage(1); } }), props.filters && (_jsx("div", { class: "vauth-users-table-filters", children: props.filters })), _jsxs("span", { class: "vauth-users-table-count", children: [total, " users"] })] }), list.error && _jsx("div", { class: "vauth-error", role: "alert", children: list.error.message }), _jsxs("table", { children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", {}), _jsx("th", { children: "Email" }), _jsx("th", { children: "Name" }), _jsx("th", { children: "Roles" }), _jsx("th", { children: "Status" }), _jsx("th", { children: "Provider" })] }) }), _jsxs("tbody", { children: [items.map((u) => (_jsxs("tr", { class: "vauth-users-table-row", onClick: () => props.onRowClick?.(u), tabIndex: props.onRowClick ? 0 : -1, role: props.onRowClick ? 'button' : undefined, children: [_jsx("td", { children: _jsx(UserAvatar, { size: 28, user: {
                                                id: u.id,
                                                email: u.email,
                                                ...(u.display_name && { displayName: u.display_name }),
                                            } }) }), _jsx("td", { children: u.email }), _jsx("td", { children: u.display_name ?? (`${u.first_name ?? ''} ${u.last_name ?? ''}`.trim() || '—') }), _jsx("td", { children: u.roles && u.roles.length > 0 ? roleLabels(u.roles).join(', ') : '—' }), _jsx("td", { children: u.status ?? '—' }), _jsx("td", { children: u.auth_provider ?? '—' })] }, u.id))), items.length === 0 && !list.loading && (_jsx("tr", { children: _jsx("td", { colSpan: 6, class: "vauth-users-table-empty", children: "No users." }) }))] })] }), totalPages > 1 && (_jsxs("footer", { class: "vauth-users-table-footer", children: [_jsx("button", { type: "button", class: "vauth-btn vauth-btn-ghost vauth-btn-sm", onClick: () => setPage((p) => Math.max(1, p - 1)), disabled: page <= 1 || list.loading, children: "Previous" }), _jsxs("span", { children: ["Page ", page, " of ", totalPages] }), _jsx("button", { type: "button", class: "vauth-btn vauth-btn-ghost vauth-btn-sm", onClick: () => setPage((p) => Math.min(totalPages, p + 1)), disabled: page >= totalPages || list.loading, children: "Next" })] }))] }));
}
//# sourceMappingURL=UsersTable.js.map