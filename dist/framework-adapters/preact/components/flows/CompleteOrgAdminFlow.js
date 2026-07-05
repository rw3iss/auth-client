import { jsx as _jsx, jsxs as _jsxs } from "preact/jsx-runtime";
/** @jsxImportSource preact */
import { useState } from 'preact/hooks';
import { OrgSettingsForm } from '../forms/OrgSettingsForm.js';
import { MembersList } from '../forms/MembersList.js';
import { InviteMemberForm } from '../forms/InviteMemberForm.js';
import { InvitationsAdminList } from '../forms/InvitationsAdminList.js';
import { OrgRoleEditor } from '../forms/OrgRoleEditor.js';
import { useOrg } from '../../hooks.js';
export function CompleteOrgAdminFlow(props) {
    const org = useOrg(props.client);
    const orgId = props.orgId ?? org?.id;
    const [inviteTick, setInviteTick] = useState(0);
    if (!orgId) {
        return (_jsxs("div", { class: `vauth-flow vauth-flow-org-admin-empty ${props.className ?? ''}`, children: [_jsx("header", { class: "vauth-flow-header", children: _jsx("h1", { children: "Organization administration" }) }), _jsx("p", { class: "vauth-flow-text", children: "No active organization. Switch to one first." })] }));
    }
    return (_jsxs("div", { class: `vauth-flow vauth-flow-org-admin ${props.className ?? ''}`, children: [_jsxs("header", { class: "vauth-flow-header", children: [_jsx("h1", { children: "Organization administration" }), _jsx("p", { class: "vauth-flow-sub", children: "Manage settings, members, invitations, and roles." })] }), _jsxs("section", { class: "vauth-section", children: [_jsx("h2", { children: "Settings" }), _jsx(OrgSettingsForm, { ...(props.client !== undefined && { client: props.client }), orgId: orgId })] }), _jsxs("section", { class: "vauth-section", children: [_jsx("h2", { children: "Members" }), _jsx(MembersList, { ...(props.client !== undefined && { client: props.client }), orgId: orgId })] }), _jsxs("section", { class: "vauth-section", children: [_jsx("h2", { children: "Invitations" }), _jsx(InviteMemberForm, { ...(props.client !== undefined && { client: props.client }), orgId: orgId, onCreated: () => setInviteTick((t) => t + 1) }), _jsx("div", { class: "vauth-section-footer", children: _jsx(InvitationsAdminList, { ...(props.client !== undefined && { client: props.client }), orgId: orgId, refreshKey: inviteTick }) })] }), _jsxs("section", { class: "vauth-section", children: [_jsx("h2", { children: "Roles" }), _jsx(OrgRoleEditor, { ...(props.client !== undefined && { client: props.client }), orgId: orgId })] })] }));
}
//# sourceMappingURL=CompleteOrgAdminFlow.js.map