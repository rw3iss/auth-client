import { jsx as _jsx, jsxs as _jsxs } from "preact/jsx-runtime";
/** @jsxImportSource preact */
import { useState } from 'preact/hooks';
import { useRequestMagicLink } from '../../actions.js';
export function MagicLinkRequestForm(props) {
    const action = useRequestMagicLink(props.client);
    const [email, setEmail] = useState(props.defaultEmail ?? '');
    const [submitted, setSubmitted] = useState(false);
    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            await action.run({
                email,
                ...(props.appCode && { appCode: props.appCode }),
            });
            setSubmitted(true);
            props.onSuccess?.();
        }
        catch (err) {
            props.onError?.(err instanceof Error ? err : new Error(String(err)));
        }
    };
    if (submitted) {
        return (_jsx("div", { class: `vauth-form-success ${props.className ?? ''}`, role: "status", children: props.successMessage ??
                "If that email is registered with us, you'll receive a sign-in link shortly." }));
    }
    return (_jsxs("form", { class: `vauth-form vauth-magic-link-form ${props.className ?? ''}`, onSubmit: onSubmit, noValidate: true, children: [_jsxs("label", { class: "vauth-field", children: [_jsx("span", { class: "vauth-field-label", children: "Email" }), _jsx("input", { type: "email", autoComplete: "email", required: true, value: email, onInput: (e) => setEmail(e.target.value), disabled: action.loading }), _jsx("span", { class: "vauth-field-hint", children: "We'll email you a one-tap sign-in link. No password required." })] }), action.error && _jsx("div", { class: "vauth-error", role: "alert", children: action.error.message }), _jsx("button", { type: "submit", class: "vauth-btn vauth-btn-primary", disabled: action.loading || email.trim() === '', "aria-busy": action.loading, children: action.loading ? 'Sending…' : 'Email me a sign-in link' })] }));
}
//# sourceMappingURL=MagicLinkRequestForm.js.map