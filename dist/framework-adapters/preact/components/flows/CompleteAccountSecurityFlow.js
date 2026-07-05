import { jsx as _jsx, jsxs as _jsxs } from "preact/jsx-runtime";
/** @jsxImportSource preact */
import { ChangePasswordForm } from '../forms/ChangePasswordForm.js';
import { TwoFactorEnrollment } from '../forms/TwoFactorEnrollment.js';
import { TwoFactorDisableForm } from '../forms/TwoFactorDisableForm.js';
import { SessionsList } from '../forms/SessionsList.js';
import { LogoutAllButton } from '../atoms/LogoutAllButton.js';
import { useAuth } from '../../hooks.js';
export function CompleteAccountSecurityFlow(props) {
    const snap = useAuth(props.client);
    if (snap.status !== 'authenticated')
        return null;
    return (_jsxs("div", { class: `vauth-flow vauth-flow-security ${props.className ?? ''}`, children: [_jsxs("header", { class: "vauth-flow-header", children: [_jsx("h1", { children: "Account security" }), _jsx("p", { class: "vauth-flow-sub", children: "Manage your password, 2FA, and active sessions." })] }), _jsxs("section", { class: "vauth-section", children: [_jsx("h2", { children: "Password" }), _jsx(ChangePasswordForm, { ...(props.client !== undefined && { client: props.client }) })] }), _jsxs("section", { class: "vauth-section", children: [_jsx("h2", { children: "Two-factor authentication" }), _jsxs("details", { children: [_jsx("summary", { children: "Set up a new authenticator" }), _jsx(TwoFactorEnrollment, { ...(props.client !== undefined && { client: props.client }) })] }), _jsxs("details", { children: [_jsx("summary", { children: "Disable two-factor" }), _jsx(TwoFactorDisableForm, { ...(props.client !== undefined && { client: props.client }) })] })] }), _jsxs("section", { class: "vauth-section", children: [_jsx("h2", { children: "Active sessions" }), _jsx(SessionsList, { ...(props.client !== undefined && { client: props.client }) }), _jsx("div", { class: "vauth-section-footer", children: _jsx(LogoutAllButton, { ...(props.client !== undefined && { client: props.client }) }) })] })] }));
}
//# sourceMappingURL=CompleteAccountSecurityFlow.js.map