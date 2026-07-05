import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "preact/jsx-runtime";
/** @jsxImportSource preact */
import { useEffect, useRef, useState } from 'preact/hooks';
import { useAuth } from '../../hooks.js';
import { UserAvatar } from './UserAvatar.js';
import { LogoutButton } from './LogoutButton.js';
export function UserMenu(props) {
    const snap = useAuth(props.client);
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    useEffect(() => {
        if (!open)
            return;
        const onDown = (e) => {
            if (ref.current && !ref.current.contains(e.target))
                setOpen(false);
        };
        const onKey = (e) => {
            if (e.key === 'Escape')
                setOpen(false);
        };
        document.addEventListener('mousedown', onDown);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('mousedown', onDown);
            document.removeEventListener('keydown', onKey);
        };
    }, [open]);
    if (snap.status !== 'authenticated')
        return null;
    const claims = snap.claims;
    const displayName = claims?.display_name ??
        (`${claims?.first_name ?? ''} ${claims?.last_name ?? ''}`.trim() || snap.user?.email);
    const interactiveIdentity = !!(props.onIdentityClick || props.identityHref);
    const identityInner = (_jsxs(_Fragment, { children: [_jsx("div", { class: "vauth-user-menu-name", children: displayName }), _jsx("div", { class: "vauth-user-menu-email", children: snap.user?.email }), claims?.org_name && _jsx("div", { class: "vauth-user-menu-org", children: claims.org_name })] }));
    const onIdentity = () => {
        props.onIdentityClick?.();
        setOpen(false);
    };
    return (_jsxs("div", { class: "vauth-user-menu", ref: ref, children: [_jsx("button", { type: "button", class: "vauth-user-menu-trigger", "aria-haspopup": "true", "aria-expanded": open, onClick: () => setOpen((o) => !o), children: _jsx(UserAvatar, { size: 32, ...(props.client !== undefined && { client: props.client }) }) }), open && (_jsxs("div", { class: "vauth-user-menu-panel", role: "menu", children: [props.identityHref ? (_jsx("a", { class: "vauth-user-menu-identity vauth-user-menu-identity-link", href: props.identityHref, role: "menuitem", onClick: () => setOpen(false), children: identityInner })) : interactiveIdentity ? (_jsx("button", { type: "button", class: "vauth-user-menu-identity vauth-user-menu-identity-link", role: "menuitem", onClick: onIdentity, children: identityInner })) : (_jsx("div", { class: "vauth-user-menu-identity", children: identityInner })), props.extra && _jsx("div", { class: "vauth-user-menu-extra", children: props.extra }), _jsx(LogoutButton, { variant: "ghost", className: "vauth-user-menu-logout", ...(props.client !== undefined && { client: props.client }) })] }))] }));
}
//# sourceMappingURL=UserMenu.js.map