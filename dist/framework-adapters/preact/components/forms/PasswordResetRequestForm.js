import { jsx as _jsx, jsxs as _jsxs } from "preact/jsx-runtime";
/** @jsxImportSource preact */
import { useState } from 'preact/hooks';
import { useRequestPasswordReset } from '../../actions.js';
export function PasswordResetRequestForm(props) {
    const action = useRequestPasswordReset(props.client);
    const [email, setEmail] = useState(props.defaultEmail ?? '');
    const [submitted, setSubmitted] = useState(false);
    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            await action.run({ email });
            setSubmitted(true);
            props.onSuccess?.();
        }
        catch (err) {
            props.onError?.(err instanceof Error ? err : new Error(String(err)));
        }
    };
    if (submitted) {
        return (_jsx("div", { class: `vauth-form-success ${props.className ?? ''}`, role: "status", children: props.successMessage ??
                "If that email is registered with us, you'll receive a reset link shortly." }));
    }
    return (_jsxs("form", { class: `vauth-form vauth-password-reset-request-form ${props.className ?? ''}`, onSubmit: onSubmit, noValidate: true, children: [_jsxs("label", { class: "vauth-field", children: [_jsx("span", { class: "vauth-field-label", children: "Email" }), _jsx("input", { type: "email", autoComplete: "email", required: true, value: email, onInput: (e) => setEmail(e.target.value), disabled: action.loading })] }), action.error && _jsx("div", { class: "vauth-error", role: "alert", children: action.error.message }), _jsx("button", { type: "submit", class: "vauth-btn vauth-btn-primary", disabled: action.loading, "aria-busy": action.loading, children: action.loading ? 'Sending…' : 'Send reset link' })] }));
}
//# sourceMappingURL=PasswordResetRequestForm.js.map