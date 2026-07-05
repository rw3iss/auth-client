import { jsx as _jsx, jsxs as _jsxs } from "preact/jsx-runtime";
/** @jsxImportSource preact */
import { useState } from 'preact/hooks';
import { useResetPassword } from '../../actions.js';
import { PasswordStrengthMeter } from '../atoms/PasswordStrengthMeter.js';
export function PasswordResetForm(props) {
    const action = useResetPassword(props.client);
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [localError, setLocalError] = useState(null);
    const onSubmit = async (e) => {
        e.preventDefault();
        setLocalError(null);
        if (password !== confirm) {
            setLocalError("Passwords don't match.");
            return;
        }
        try {
            await action.run({ token: props.token, newPassword: password });
            setSubmitted(true);
            props.onSuccess?.();
        }
        catch (err) {
            props.onError?.(err instanceof Error ? err : new Error(String(err)));
        }
    };
    if (submitted) {
        return (_jsxs("div", { class: `vauth-form-success ${props.className ?? ''}`, role: "status", children: [_jsx("p", { children: "Your password has been updated." }), props.loginHref && (_jsx("a", { class: "vauth-btn vauth-btn-primary", href: props.loginHref, children: "Sign in" }))] }));
    }
    const displayError = localError ?? action.error?.message ?? null;
    return (_jsxs("form", { class: `vauth-form vauth-password-reset-form ${props.className ?? ''}`, onSubmit: onSubmit, noValidate: true, children: [_jsxs("label", { class: "vauth-field", children: [_jsx("span", { class: "vauth-field-label", children: "New password" }), _jsx("input", { type: "password", autoComplete: "new-password", required: true, minLength: 8, value: password, onInput: (e) => setPassword(e.target.value), disabled: action.loading }), _jsx(PasswordStrengthMeter, { password: password })] }), _jsxs("label", { class: "vauth-field", children: [_jsx("span", { class: "vauth-field-label", children: "Confirm new password" }), _jsx("input", { type: "password", autoComplete: "new-password", required: true, value: confirm, onInput: (e) => setConfirm(e.target.value), disabled: action.loading })] }), displayError && _jsx("div", { class: "vauth-error", role: "alert", children: displayError }), _jsx("button", { type: "submit", class: "vauth-btn vauth-btn-primary", disabled: action.loading, "aria-busy": action.loading, children: action.loading ? 'Updating…' : 'Update password' })] }));
}
//# sourceMappingURL=PasswordResetForm.js.map