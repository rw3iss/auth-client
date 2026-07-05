import { jsx as _jsx, jsxs as _jsxs } from "preact/jsx-runtime";
/** @jsxImportSource preact */
import { useState } from 'preact/hooks';
import { useImpersonate } from '../../actions.js';
import { useAuth } from '../../hooks.js';
export function CompleteImpersonationFlow(props) {
    const snap = useAuth(props.client);
    const impersonate = useImpersonate(props.client);
    const [userId, setUserId] = useState('');
    const [reason, setReason] = useState('');
    if (snap.isImpersonating) {
        return (_jsxs("div", { class: `vauth-flow vauth-flow-impersonating ${props.className ?? ''}`, role: "status", children: [_jsxs("header", { class: "vauth-flow-header", children: [_jsx("h1", { children: "You are impersonating" }), _jsxs("p", { class: "vauth-flow-sub", children: ["Acting as ", _jsx("strong", { children: snap.user?.email ?? '…' }), " from", _jsxs("strong", { children: [" ", snap.claims?.imp_email ?? 'unknown admin'] }), "."] })] }), _jsx("p", { class: "vauth-flow-text", children: "To return to your own session, sign out and sign back in as yourself." })] }));
    }
    const onSubmit = async (e) => {
        e.preventDefault();
        const resp = await impersonate.run({ targetUserId: userId, reason });
        props.onStarted?.(resp);
    };
    return (_jsxs("div", { class: `vauth-flow vauth-flow-impersonate ${props.className ?? ''}`, children: [_jsxs("header", { class: "vauth-flow-header", children: [_jsx("h1", { children: "Impersonate a user" }), _jsx("p", { class: "vauth-flow-sub", children: "For support / debugging. Every action is audited under your name." })] }), _jsxs("form", { onSubmit: onSubmit, children: [_jsxs("label", { class: "vauth-field", children: [_jsx("span", { class: "vauth-field-label", children: "Target user id" }), _jsx("input", { class: "vauth-input", type: "text", required: true, value: userId, onInput: (e) => setUserId(e.target.value), disabled: impersonate.loading })] }), _jsxs("label", { class: "vauth-field", children: [_jsx("span", { class: "vauth-field-label", children: "Reason (required for audit log)" }), _jsx("input", { class: "vauth-input", type: "text", required: true, minLength: 3, value: reason, onInput: (e) => setReason(e.target.value), disabled: impersonate.loading })] }), impersonate.error && _jsx("div", { class: "vauth-error", role: "alert", children: impersonate.error.message }), _jsx("button", { type: "submit", class: "vauth-btn vauth-btn-danger", disabled: impersonate.loading, "aria-busy": impersonate.loading, children: impersonate.loading ? 'Starting…' : 'Begin impersonation' })] })] }));
}
//# sourceMappingURL=CompleteImpersonationFlow.js.map