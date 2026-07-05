import { jsx as _jsx, jsxs as _jsxs } from "preact/jsx-runtime";
/** @jsxImportSource preact */
import { PasswordResetRequestForm } from '../forms/PasswordResetRequestForm.js';
import { PasswordResetForm } from '../forms/PasswordResetForm.js';
export function CompletePasswordResetFlow(props) {
    if (props.token) {
        return (_jsxs("div", { class: `vauth-flow vauth-flow-reset ${props.className ?? ''}`, children: [_jsxs("header", { class: "vauth-flow-header", children: [_jsx("h1", { children: "Set a new password" }), _jsx("p", { class: "vauth-flow-sub", children: "Choose something you don't use elsewhere." })] }), _jsx(PasswordResetForm, { token: props.token, ...(props.client !== undefined && { client: props.client }), ...(props.loginHref && { loginHref: props.loginHref }) })] }));
    }
    return (_jsxs("div", { class: `vauth-flow vauth-flow-reset-request ${props.className ?? ''}`, children: [_jsxs("header", { class: "vauth-flow-header", children: [_jsx("h1", { children: "Reset your password" }), _jsx("p", { class: "vauth-flow-sub", children: "We'll email you a link to set a new one." })] }), _jsx(PasswordResetRequestForm, { ...(props.client !== undefined && { client: props.client }) }), props.loginHref && (_jsxs("p", { class: "vauth-flow-footer", children: ["Remembered it? ", _jsx("a", { href: props.loginHref, children: "Back to sign in" })] }))] }));
}
//# sourceMappingURL=CompletePasswordResetFlow.js.map