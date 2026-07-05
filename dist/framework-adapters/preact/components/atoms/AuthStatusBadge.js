import { jsx as _jsx, jsxs as _jsxs } from "preact/jsx-runtime";
/** @jsxImportSource preact */
import { useAuth } from '../../hooks.js';
export function AuthStatusBadge(props) {
    const snap = useAuth(props.client);
    const status = snap.status;
    const label = status === 'authenticated' ? 'Signed in' :
        status === 'anonymous' ? 'Signed out' :
            status === 'offline' ? 'Offline' :
                'Loading…';
    return (_jsxs("span", { class: `vauth-status-badge vauth-status-${status} ${props.className ?? ''}`, "data-status": status, children: [_jsx("span", { class: "vauth-status-dot", "aria-hidden": "true" }), label] }));
}
//# sourceMappingURL=AuthStatusBadge.js.map