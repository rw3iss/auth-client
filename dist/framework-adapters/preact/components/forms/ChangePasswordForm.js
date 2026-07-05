import { jsx as _jsx, jsxs as _jsxs } from "preact/jsx-runtime";
/** @jsxImportSource preact */
import { useState } from 'preact/hooks';
import { useChangePassword } from '../../actions.js';
import { PasswordStrengthMeter } from '../atoms/PasswordStrengthMeter.js';
export function ChangePasswordForm(props) {
    const action = useChangePassword(props.client);
    const [current, setCurrent] = useState('');
    const [next, setNext] = useState('');
    const [confirm, setConfirm] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [localError, setLocalError] = useState(null);
    const onSubmit = async (e) => {
        e.preventDefault();
        setLocalError(null);
        if (next !== confirm) {
            setLocalError("New passwords don't match.");
            return;
        }
        if (next === current) {
            setLocalError("New password must differ from the current one.");
            return;
        }
        try {
            await action.run({ currentPassword: current, newPassword: next });
            setSubmitted(true);
            setCurrent('');
            setNext('');
            setConfirm('');
            props.onSuccess?.();
        }
        catch (err) {
            props.onError?.(err instanceof Error ? err : new Error(String(err)));
        }
    };
    const displayError = localError ?? action.error?.message ?? null;
    return (_jsxs("form", { class: `vauth-form vauth-change-password-form ${props.className ?? ''}`, onSubmit: onSubmit, noValidate: true, children: [_jsxs("label", { class: "vauth-field", children: [_jsx("span", { class: "vauth-field-label", children: "Current password" }), _jsx("input", { type: "password", autoComplete: "current-password", required: true, value: current, onInput: (e) => setCurrent(e.target.value), disabled: action.loading })] }), _jsxs("label", { class: "vauth-field", children: [_jsx("span", { class: "vauth-field-label", children: "New password" }), _jsx("input", { type: "password", autoComplete: "new-password", required: true, minLength: 8, value: next, onInput: (e) => setNext(e.target.value), disabled: action.loading }), _jsx(PasswordStrengthMeter, { password: next })] }), _jsxs("label", { class: "vauth-field", children: [_jsx("span", { class: "vauth-field-label", children: "Confirm new password" }), _jsx("input", { type: "password", autoComplete: "new-password", required: true, value: confirm, onInput: (e) => setConfirm(e.target.value), disabled: action.loading })] }), displayError && _jsx("div", { class: "vauth-error", role: "alert", children: displayError }), submitted && !displayError && (_jsx("div", { class: "vauth-form-success", role: "status", children: "Password updated." })), _jsx("button", { type: "submit", class: "vauth-btn vauth-btn-primary", disabled: action.loading, "aria-busy": action.loading, children: action.loading ? 'Updating…' : 'Update password' })] }));
}
//# sourceMappingURL=ChangePasswordForm.js.map