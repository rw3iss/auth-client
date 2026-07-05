import { jsx as _jsx, jsxs as _jsxs } from "preact/jsx-runtime";
/** @jsxImportSource preact */
import { useState } from 'preact/hooks';
import { useResendVerificationEmail } from '../../actions.js';
import { useAuth } from '../../hooks.js';
export function EmailVerificationNotice(props) {
    const snap = useAuth(props.client);
    const resend = useResendVerificationEmail(props.client);
    const [sentAt, setSentAt] = useState(null);
    const email = props.email ?? snap.user?.email;
    if (!email)
        return null;
    const onResend = async () => {
        await resend.run({ email, ...(props.appCode && { appCode: props.appCode }) });
        setSentAt(Date.now());
    };
    return (_jsxs("div", { class: `vauth-verify-notice ${props.className ?? ''}`, children: [_jsx("div", { class: "vauth-verify-notice-icon", "aria-hidden": "true", children: "\uD83D\uDCE7" }), _jsxs("div", { class: "vauth-verify-notice-body", children: [_jsx("h3", { class: "vauth-verify-notice-title", children: "Check your email" }), _jsxs("p", { class: "vauth-verify-notice-text", children: ["We sent a verification link to ", _jsx("strong", { children: email }), ". Click the link in that email to confirm your address."] }), sentAt && (_jsx("p", { class: "vauth-verify-notice-confirm", role: "status", children: "Resent \u2014 check your inbox." })), _jsx("button", { type: "button", class: "vauth-btn vauth-btn-ghost", onClick: onResend, disabled: resend.loading, "aria-busy": resend.loading, children: resend.loading ? 'Sending…' : 'Resend verification email' })] })] }));
}
//# sourceMappingURL=EmailVerificationNotice.js.map