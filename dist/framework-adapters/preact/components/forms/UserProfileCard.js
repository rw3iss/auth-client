import { jsx as _jsx, jsxs as _jsxs } from "preact/jsx-runtime";
/** @jsxImportSource preact */
import { useAuth } from '../../hooks.js';
import { UserAvatar } from '../atoms/UserAvatar.js';
export function UserProfileCard(props) {
    const snap = useAuth(props.client);
    if (snap.status !== 'authenticated')
        return null;
    const claims = snap.claims;
    const showRoles = props.showRoles !== false;
    return (_jsxs("div", { class: `vauth-profile-card ${props.className ?? ''}`, children: [_jsx(UserAvatar, { size: 56, ...(props.client !== undefined && { client: props.client }) }), _jsxs("div", { class: "vauth-profile-card-body", children: [_jsx("h3", { class: "vauth-profile-card-name", children: claims?.display_name ?? (`${claims?.first_name ?? ''} ${claims?.last_name ?? ''}`.trim() || snap.user?.email) }), _jsx("div", { class: "vauth-profile-card-email", children: snap.user?.email }), claims?.org_name && (_jsxs("div", { class: "vauth-profile-card-org", children: [_jsx("span", { class: "vauth-profile-card-label", children: "Organization" }), _jsx("span", { children: claims.org_name })] })), showRoles && claims?.roles && claims.roles.length > 0 && (_jsx("div", { class: "vauth-profile-card-roles", children: claims.roles.map((r) => _jsx("span", { class: "vauth-tag", children: r }, r)) })), snap.isImpersonating && claims?.imp_email && (_jsxs("div", { class: "vauth-profile-card-imp", role: "status", children: ["Impersonating \u2014 acting on behalf of this user from ", _jsx("strong", { children: claims.imp_email })] }))] })] }));
}
//# sourceMappingURL=UserProfileCard.js.map