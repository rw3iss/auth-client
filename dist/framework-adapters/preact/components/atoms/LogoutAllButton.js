import { jsx as _jsx } from "preact/jsx-runtime";
/** @jsxImportSource preact */
import { useLogoutAll } from '../../actions.js';
export function LogoutAllButton(props) {
    const logoutAll = useLogoutAll(props.client);
    const variant = props.variant ?? 'danger';
    const onClick = async () => {
        if (props.confirm !== false) {
            const ok = typeof window !== 'undefined'
                ? window.confirm('Sign out of every device? You will be signed out everywhere immediately.')
                : true;
            if (!ok)
                return;
        }
        await logoutAll.run();
        props.onComplete?.();
    };
    return (_jsx("button", { type: "button", class: `vauth-btn vauth-btn-${variant} ${props.className ?? ''}`, onClick: onClick, disabled: logoutAll.loading, "aria-busy": logoutAll.loading, children: logoutAll.loading ? 'Signing out everywhere…' : (props.label ?? 'Sign out of all devices') }));
}
//# sourceMappingURL=LogoutAllButton.js.map