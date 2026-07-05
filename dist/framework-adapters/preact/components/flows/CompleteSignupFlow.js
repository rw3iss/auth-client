import { jsx as _jsx, jsxs as _jsxs } from "preact/jsx-runtime";
/** @jsxImportSource preact */
import { useState } from 'preact/hooks';
import { RegisterForm } from '../forms/RegisterForm.js';
import { EmailVerificationNotice } from '../forms/EmailVerificationNotice.js';
import { SsoButtonGroup } from '../atoms/SsoButtonGroup.js';
export function CompleteSignupFlow(props) {
    const [registered, setRegistered] = useState(null);
    const redirect = props.ssoRedirectUrl ??
        (typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : '/auth/callback');
    if (registered) {
        return (_jsxs("div", { class: `vauth-flow vauth-flow-signup-success ${props.className ?? ''}`, children: [_jsxs("header", { class: "vauth-flow-header", children: [_jsx("h1", { children: "Account created" }), _jsx("p", { class: "vauth-flow-sub", children: "One last step." })] }), _jsx(EmailVerificationNotice, { ...(props.client !== undefined && { client: props.client }), ...(registered.user?.email && { email: registered.user.email }) })] }));
    }
    return (_jsxs("div", { class: `vauth-flow vauth-flow-signup ${props.className ?? ''}`, children: [_jsxs("header", { class: "vauth-flow-header", children: [_jsx("h1", { children: "Create your account" }), _jsx("p", { class: "vauth-flow-sub", children: "Start with SSO or fill in the form below." })] }), _jsx(SsoButtonGroup, { redirectUrl: redirect, ...(props.client !== undefined && { client: props.client }) }), _jsx("div", { class: "vauth-divider", role: "separator", children: _jsx("span", { children: "or with email" }) }), _jsx(RegisterForm, { ...(props.client !== undefined && { client: props.client }), onSuccess: (resp) => {
                    setRegistered(resp);
                    props.onSuccess?.(resp);
                } }), props.loginHref && (_jsxs("p", { class: "vauth-flow-footer", children: ["Already have an account? ", _jsx("a", { href: props.loginHref, children: "Sign in" })] }))] }));
}
//# sourceMappingURL=CompleteSignupFlow.js.map