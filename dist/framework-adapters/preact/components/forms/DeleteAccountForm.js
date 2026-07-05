import { jsx as _jsx, jsxs as _jsxs } from "preact/jsx-runtime";
/** @jsxImportSource preact */
import { useState } from 'preact/hooks';
import { useDeleteMyAccount } from '../../actions.js';
export function DeleteAccountForm(props) {
    const action = useDeleteMyAccount(props.client);
    const [password, setPassword] = useState('');
    const [confirmation, setConfirmation] = useState('');
    const canSubmit = password.length > 0 && confirmation === 'DELETE';
    const onSubmit = async (e) => {
        e.preventDefault();
        if (!canSubmit)
            return;
        try {
            await action.run(password);
            props.onDeleted?.();
        }
        catch (err) {
            props.onError?.(err instanceof Error ? err : new Error(String(err)));
        }
    };
    return (_jsxs("form", { class: `vauth-form vauth-delete-account-form ${props.className ?? ''}`, onSubmit: onSubmit, noValidate: true, children: [_jsxs("div", { class: "vauth-danger-banner", children: [_jsx("strong", { children: "Permanent." }), ' ', "Deleting your account removes your data immediately and can't be undone. Active sessions across all devices will end the moment we finish."] }), _jsxs("label", { class: "vauth-field", children: [_jsx("span", { class: "vauth-field-label", children: "Current password" }), _jsx("input", { type: "password", autoComplete: "current-password", required: true, value: password, onInput: (e) => setPassword(e.target.value), disabled: action.loading })] }), _jsxs("label", { class: "vauth-field", children: [_jsxs("span", { class: "vauth-field-label", children: ["Type ", _jsx("code", { children: "DELETE" }), " to confirm"] }), _jsx("input", { type: "text", autoComplete: "off", spellcheck: false, required: true, value: confirmation, onInput: (e) => setConfirmation(e.target.value), disabled: action.loading })] }), action.error && _jsx("div", { class: "vauth-error", role: "alert", children: action.error.message }), _jsx("button", { type: "submit", class: "vauth-btn vauth-btn-danger", disabled: !canSubmit || action.loading, "aria-busy": action.loading, children: action.loading ? 'Deleting…' : 'Permanently delete my account' })] }));
}
//# sourceMappingURL=DeleteAccountForm.js.map