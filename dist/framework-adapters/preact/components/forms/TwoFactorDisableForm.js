import { jsx as _jsx, jsxs as _jsxs } from "preact/jsx-runtime";
/** @jsxImportSource preact */
import { useState } from 'preact/hooks';
import { useDisableTwoFactor } from '../../actions.js';
export function TwoFactorDisableForm(props) {
    const action = useDisableTwoFactor(props.client);
    const [password, setPassword] = useState('');
    const [code, setCode] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            await action.run({ password, code });
            setSubmitted(true);
            setPassword('');
            setCode('');
            props.onSuccess?.();
        }
        catch (err) {
            props.onError?.(err instanceof Error ? err : new Error(String(err)));
        }
    };
    if (submitted) {
        return (_jsx("div", { class: `vauth-form-success ${props.className ?? ''}`, role: "status", children: "Two-factor authentication disabled." }));
    }
    return (_jsxs("form", { class: `vauth-form vauth-2fa-disable-form ${props.className ?? ''}`, onSubmit: onSubmit, noValidate: true, children: [_jsxs("label", { class: "vauth-field", children: [_jsx("span", { class: "vauth-field-label", children: "Password" }), _jsx("input", { type: "password", autoComplete: "current-password", required: true, value: password, onInput: (e) => setPassword(e.target.value), disabled: action.loading })] }), _jsxs("label", { class: "vauth-field", children: [_jsx("span", { class: "vauth-field-label", children: "Current 2FA code" }), _jsx("input", { type: "text", inputMode: "numeric", pattern: "[0-9]*", maxLength: 6, autoComplete: "one-time-code", required: true, value: code, onInput: (e) => setCode(e.target.value), disabled: action.loading })] }), action.error && _jsx("div", { class: "vauth-error", role: "alert", children: action.error.message }), _jsx("button", { type: "submit", class: "vauth-btn vauth-btn-danger", disabled: action.loading || code.length !== 6, "aria-busy": action.loading, children: action.loading ? 'Disabling…' : 'Disable 2FA' })] }));
}
//# sourceMappingURL=TwoFactorDisableForm.js.map