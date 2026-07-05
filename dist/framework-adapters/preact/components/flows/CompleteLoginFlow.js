import { jsx as _jsx, jsxs as _jsxs } from "preact/jsx-runtime";
/** @jsxImportSource preact */
import { LoginForm } from '../forms/LoginForm.js';
import { SsoButtonGroup } from '../atoms/SsoButtonGroup.js';
export function CompleteLoginFlow(props) {
    const redirect = props.ssoRedirectUrl ??
        (typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : '/auth/callback');
    return (_jsxs("div", { class: `vauth-flow vauth-flow-login ${props.className ?? ''}`, children: [_jsxs("header", { class: "vauth-flow-header", children: [_jsx("h1", { children: "Sign in" }), _jsx("p", { class: "vauth-flow-sub", children: "Welcome back. Pick a sign-in method." })] }), _jsx(SsoButtonGroup, { redirectUrl: redirect, ...(props.client !== undefined && { client: props.client }) }), _jsx("div", { class: "vauth-divider", role: "separator", children: _jsx("span", { children: "or with email" }) }), _jsx(LoginForm, { ...(props.client !== undefined && { client: props.client }), ...(props.forgotPasswordHref && { forgotPasswordHref: props.forgotPasswordHref }), ...(props.onSuccess && { onSuccess: props.onSuccess }) }), props.registerHref && (_jsxs("p", { class: "vauth-flow-footer", children: ["No account? ", _jsx("a", { href: props.registerHref, children: "Create one" })] }))] }));
}
//# sourceMappingURL=CompleteLoginFlow.js.map