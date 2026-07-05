import { jsx as _jsx, jsxs as _jsxs } from "preact/jsx-runtime";
/** @jsxImportSource preact */
import { useState } from 'preact/hooks';
import { useCreateInvitation } from '../../actions.js';
import { useOrg } from '../../hooks.js';
export function InviteMemberForm(props) {
    const org = useOrg(props.client);
    const create = useCreateInvitation(props.client);
    const [email, setEmail] = useState('');
    const orgId = props.orgId ?? org?.id;
    const onSubmit = async (e) => {
        e.preventDefault();
        if (!orgId)
            return;
        try {
            const invitation = await create.run({
                orgId,
                body: {
                    email,
                    ...(props.defaultRoleIds && props.defaultRoleIds.length > 0 && { role_ids: props.defaultRoleIds }),
                },
            });
            setEmail('');
            props.onCreated?.(invitation);
        }
        catch (err) {
            props.onError?.(err instanceof Error ? err : new Error(String(err)));
        }
    };
    if (!orgId) {
        return _jsx("div", { class: "vauth-form-loading", children: "No active organization." });
    }
    return (_jsxs("form", { class: `vauth-form vauth-invite-form ${props.className ?? ''}`, onSubmit: onSubmit, noValidate: true, children: [_jsxs("label", { class: "vauth-field", children: [_jsx("span", { class: "vauth-field-label", children: "Invite by email" }), _jsx("input", { type: "email", autoComplete: "email", required: true, placeholder: "teammate@example.com", value: email, onInput: (e) => setEmail(e.target.value), disabled: create.loading }), _jsx("span", { class: "vauth-field-hint", children: "They'll receive an email with a sign-up link scoped to this org." })] }), create.error && _jsx("div", { class: "vauth-error", role: "alert", children: create.error.message }), create.data && (_jsxs("div", { class: "vauth-form-success", role: "status", children: ["Invitation sent to ", create.data.email, "."] })), _jsx("button", { type: "submit", class: "vauth-btn vauth-btn-primary", disabled: create.loading || email.trim() === '', "aria-busy": create.loading, children: create.loading ? 'Sending…' : 'Send invitation' })] }));
}
//# sourceMappingURL=InviteMemberForm.js.map