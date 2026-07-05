import { jsx as _jsx, jsxs as _jsxs } from "preact/jsx-runtime";
/** @jsxImportSource preact */
import { useState } from 'preact/hooks';
import { useRegister } from '../../actions.js';
import { PasswordStrengthMeter } from '../atoms/PasswordStrengthMeter.js';
export function RegisterForm(props) {
    const register = useRegister(props.client);
    const [email, setEmail] = useState(props.defaultEmail ?? '');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [localError, setLocalError] = useState(null);
    const onSubmit = async (e) => {
        e.preventDefault();
        setLocalError(null);
        // Client-side domain check — friendly UX. The server re-validates
        // on the actual register call so a bypass attempt still fails.
        if (props.allowedEmailDomains && props.allowedEmailDomains.length > 0) {
            const at = email.lastIndexOf('@');
            const domain = at >= 0 ? email.slice(at + 1).toLowerCase() : '';
            const ok = props.allowedEmailDomains.some((d) => d.toLowerCase() === domain);
            if (!ok) {
                setLocalError(`Your email must end in one of: ${props.allowedEmailDomains.map((d) => '@' + d).join(', ')}`);
                return;
            }
        }
        try {
            const resp = await register.run({
                email,
                password,
                firstName,
                lastName,
                ...(props.organizationId && { organizationId: props.organizationId }),
                ...(props.inviteCode && { inviteCode: props.inviteCode }),
                ...(props.inviteToken && { inviteToken: props.inviteToken }),
                ...(props.appCode && { appCode: props.appCode }),
            });
            props.onSuccess?.(resp);
        }
        catch (err) {
            const e = err instanceof Error ? err : new Error(String(err));
            setLocalError(e.message);
            props.onError?.(e);
        }
    };
    const displayError = localError ?? register.error?.message ?? null;
    return (_jsxs("form", { class: `vauth-form vauth-register-form ${props.className ?? ''}`, onSubmit: onSubmit, noValidate: true, children: [props.aboveForm, _jsxs("div", { class: "vauth-field-row", children: [_jsxs("label", { class: "vauth-field", children: [_jsx("span", { class: "vauth-field-label", children: "First name" }), _jsx("input", { type: "text", autoComplete: "given-name", required: true, value: firstName, onInput: (e) => setFirstName(e.target.value), disabled: register.loading })] }), _jsxs("label", { class: "vauth-field", children: [_jsx("span", { class: "vauth-field-label", children: "Last name" }), _jsx("input", { type: "text", autoComplete: "family-name", required: true, value: lastName, onInput: (e) => setLastName(e.target.value), disabled: register.loading })] })] }), _jsxs("label", { class: "vauth-field", children: [_jsx("span", { class: "vauth-field-label", children: "Email" }), _jsx("input", { type: "email", autoComplete: "email", required: true, value: email, onInput: (e) => setEmail(e.target.value), disabled: register.loading })] }), _jsxs("label", { class: "vauth-field", children: [_jsx("span", { class: "vauth-field-label", children: "Password" }), _jsx("input", { type: "password", autoComplete: "new-password", required: true, minLength: 8, value: password, onInput: (e) => setPassword(e.target.value), disabled: register.loading }), _jsx(PasswordStrengthMeter, { password: password }), _jsx("span", { class: "vauth-field-hint", children: "At least 8 characters, with upper, lower, and digit." })] }), displayError && _jsx("div", { class: "vauth-error", role: "alert", children: displayError }), _jsx("button", { type: "submit", class: "vauth-btn vauth-btn-primary", disabled: register.loading, "aria-busy": register.loading, children: register.loading ? 'Creating account…' : 'Create account' }), props.belowSubmit] }));
}
//# sourceMappingURL=RegisterForm.js.map