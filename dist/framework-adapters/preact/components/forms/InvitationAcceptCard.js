import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "preact/jsx-runtime";
/** @jsxImportSource preact */
import { useState } from 'preact/hooks';
import { useAcceptInvitation, useDeclineInvitation, useSwitchOrg } from '../../actions.js';
export function InvitationAcceptCard(props) {
    const accept = useAcceptInvitation(props.client);
    const decline = useDeclineInvitation(props.client);
    const switchOrg = useSwitchOrg(props.client);
    const [resolution, setResolution] = useState(null);
    const orgName = props.invitation.organization?.name ?? props.invitation.organization_id;
    const onAccept = async () => {
        await accept.run(props.invitation.id);
        if (props.autoSwitch !== false) {
            try {
                await switchOrg.run(props.invitation.organization_id);
            }
            catch { /* best-effort */ }
        }
        setResolution('accepted');
        props.onAccepted?.({ id: props.invitation.organization_id, ...(props.invitation.organization?.name && { name: props.invitation.organization.name }) });
    };
    const onDecline = async () => {
        await decline.run(props.invitation.id);
        setResolution('declined');
        props.onDeclined?.();
    };
    if (resolution === 'accepted') {
        return (_jsxs("div", { class: `vauth-invitation-accept-card vauth-form-success ${props.className ?? ''}`, role: "status", children: ["You've joined ", _jsx("strong", { children: orgName }), "."] }));
    }
    if (resolution === 'declined') {
        return (_jsx("div", { class: `vauth-invitation-accept-card ${props.className ?? ''}`, role: "status", children: "Invitation declined." }));
    }
    return (_jsxs("div", { class: `vauth-invitation-accept-card ${props.className ?? ''}`, children: [_jsx("h3", { class: "vauth-invitation-accept-title", children: "You've been invited" }), _jsxs("p", { class: "vauth-invitation-accept-text", children: ["Join ", _jsx("strong", { children: orgName }), ' ', props.invitation.invited_by_user?.email && (_jsxs(_Fragment, { children: ["\u00B7 invited by ", props.invitation.invited_by_user.email] }))] }), (accept.error || decline.error) && (_jsx("div", { class: "vauth-error", role: "alert", children: (accept.error ?? decline.error)?.message })), _jsxs("div", { class: "vauth-form-actions", children: [_jsx("button", { type: "button", class: "vauth-btn vauth-btn-primary", onClick: onAccept, disabled: accept.loading, "aria-busy": accept.loading, children: accept.loading ? 'Joining…' : `Join ${orgName}` }), _jsx("button", { type: "button", class: "vauth-btn vauth-btn-ghost", onClick: onDecline, disabled: decline.loading, children: "Decline" })] })] }));
}
//# sourceMappingURL=InvitationAcceptCard.js.map