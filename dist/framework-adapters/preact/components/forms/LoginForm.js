import { jsx as _jsx, jsxs as _jsxs } from "preact/jsx-runtime";
/** @jsxImportSource preact */
import { useState } from 'preact/hooks';
import { useLogin } from '../../actions.js';
export function LoginForm(props) {
    const login = useLogin(props.client);
    const [email, setEmail] = useState(props.defaultEmail ?? '');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [needs2fa, setNeeds2fa] = useState(false);
    const [twoFactorCode, setTwoFactorCode] = useState('');
    const [localError, setLocalError] = useState(null);
    const onSubmit = async (e) => {
        e.preventDefault();
        setLocalError(null);
        try {
            const resp = await login.run({
                email,
                password,
                ...(rememberMe && { rememberMe: true }),
                ...(needs2fa && twoFactorCode && { twoFactorCode }),
                ...(props.organizationId && { organizationId: props.organizationId }),
            });
            if (resp.requires_2fa) {
                setNeeds2fa(true);
                return;
            }
            props.onSuccess?.(resp);
        }
        catch (err) {
            const e = err instanceof Error ? err : new Error(String(err));
            setLocalError(e.message);
            props.onError?.(e);
        }
    };
    const displayError = localError ?? login.error?.message ?? null;
    return (_jsxs("form", { class: `vauth-form vauth-login-form ${props.className ?? ''}`, onSubmit: onSubmit, noValidate: true, children: [props.aboveForm, _jsxs("label", { class: "vauth-field", children: [_jsx("span", { class: "vauth-field-label", children: "Email" }), _jsx("input", { type: "email", autoComplete: "email", required: true, value: email, onInput: (e) => setEmail(e.target.value), disabled: login.loading })] }), _jsxs("label", { class: "vauth-field", children: [_jsxs("span", { class: "vauth-field-label", children: ["Password", props.forgotPasswordHref && (_jsx("a", { class: "vauth-field-link", href: props.forgotPasswordHref, children: "Forgot?" }))] }), _jsx("input", { type: "password", autoComplete: "current-password", required: true, value: password, onInput: (e) => setPassword(e.target.value), disabled: login.loading })] }), needs2fa && (_jsxs("label", { class: "vauth-field", children: [_jsx("span", { class: "vauth-field-label", children: "Two-factor code" }), _jsx("input", { type: "text", inputMode: "numeric", pattern: "[0-9]*", autoComplete: "one-time-code", maxLength: 6, required: true, value: twoFactorCode, onInput: (e) => setTwoFactorCode(e.target.value), disabled: login.loading, autoFocus: true }), _jsx("span", { class: "vauth-field-hint", children: "From your authenticator app" })] })), _jsxs("label", { class: "vauth-field-inline", children: [_jsx("input", { type: "checkbox", checked: rememberMe, onChange: (e) => setRememberMe(e.target.checked), disabled: login.loading }), _jsx("span", { children: "Keep me signed in" })] }), displayError && (_jsx("div", { class: "vauth-error", role: "alert", children: displayError })), _jsx("button", { type: "submit", class: "vauth-btn vauth-btn-primary", disabled: login.loading, "aria-busy": login.loading, children: login.loading ? 'Signing in…' : (needs2fa ? 'Verify and sign in' : 'Sign in') }), props.belowSubmit] }));
}
//# sourceMappingURL=LoginForm.js.map