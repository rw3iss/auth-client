import { jsx as _jsx, jsxs as _jsxs } from "preact/jsx-runtime";
/** @jsxImportSource preact */
import { useState } from 'preact/hooks';
import { useGetUsersBulk } from '../../actions.js';
export function UserLookupTable(props) {
    const action = useGetUsersBulk(props.client);
    const [input, setInput] = useState('');
    const [results, setResults] = useState([]);
    const onSubmit = async (e) => {
        e.preventDefault();
        const tokens = input.split(/[\s,;]+/).map((s) => s.trim()).filter(Boolean);
        const emails = tokens.filter((t) => t.includes('@'));
        const ids = tokens.filter((t) => !t.includes('@'));
        const found = await action.run({ emails, ids });
        setResults(found);
    };
    return (_jsxs("div", { class: `vauth-user-lookup ${props.className ?? ''}`, children: [_jsxs("form", { onSubmit: onSubmit, children: [_jsxs("label", { class: "vauth-field", children: [_jsx("span", { class: "vauth-field-label", children: "Emails or user ids (one per line, or comma-separated)" }), _jsx("textarea", { class: "vauth-input", rows: 4, placeholder: props.placeholder ?? 'alice@example.com\nbob@example.com\nb12c…', value: input, onInput: (e) => setInput(e.target.value), disabled: action.loading })] }), action.error && _jsx("div", { class: "vauth-error", role: "alert", children: action.error.message }), _jsx("button", { type: "submit", class: "vauth-btn vauth-btn-primary", disabled: action.loading || input.trim() === '', "aria-busy": action.loading, children: action.loading ? 'Looking up…' : 'Look up' })] }), results.length > 0 && (_jsxs("table", { class: "vauth-user-lookup-table", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Email" }), _jsx("th", { children: "Name" }), _jsx("th", { children: "Status" }), _jsx("th", { children: "Verified" }), _jsx("th", { children: "Provider" })] }) }), _jsx("tbody", { children: results.map((u) => (_jsxs("tr", { children: [_jsx("td", { children: u.email }), _jsx("td", { children: u.display_name ?? (`${u.first_name ?? ''} ${u.last_name ?? ''}`.trim() || '—') }), _jsx("td", { children: u.status ?? '—' }), _jsx("td", { children: u.email_verified ? '✓' : '—' }), _jsx("td", { children: u.auth_provider ?? '—' })] }, u.id))) })] })), action.data && results.length === 0 && (_jsx("div", { class: "vauth-user-lookup-empty", children: "No matches." }))] }));
}
//# sourceMappingURL=UserLookupTable.js.map