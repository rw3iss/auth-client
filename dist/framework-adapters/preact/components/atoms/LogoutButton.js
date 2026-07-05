import { jsx as _jsx } from "preact/jsx-runtime";
/** @jsxImportSource preact */
import { useLogout } from '../../actions.js';
export function LogoutButton(props) {
    const logout = useLogout(props.client);
    const variant = props.variant ?? 'ghost';
    const onClick = async () => {
        await logout.run();
        props.onComplete?.();
    };
    return (_jsx("button", { type: "button", class: `vauth-btn vauth-btn-${variant} ${props.className ?? ''}`, onClick: onClick, disabled: logout.loading, "aria-busy": logout.loading, children: logout.loading ? 'Signing out…' : (props.label ?? 'Sign out') }));
}
//# sourceMappingURL=LogoutButton.js.map