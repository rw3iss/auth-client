/** @jsxImportSource preact */
import { useLogout } from '../../actions.js';
import type { AuthClient } from '../../../../core/auth-client.js';

/**
 * Single-shot logout button. Calls AuthClient.logoutCurrent() and
 * surfaces in-flight + error state from the underlying action hook.
 * Disabled while pending to prevent double-submits.
 */
export interface LogoutButtonProps {
    client?: AuthClient;
    /** Override the button label. Default "Sign out". */
    label?: string;
    /** Called after a successful logout. */
    onComplete?: () => void;
    /** Extra className. */
    className?: string;
    /** style variant — "primary" | "ghost" | "danger". Default "ghost". */
    variant?: 'primary' | 'ghost' | 'danger';
}

export function LogoutButton(props: LogoutButtonProps) {
    const logout = useLogout(props.client);
    const variant = props.variant ?? 'ghost';
    const onClick = async () => {
        await logout.run();
        props.onComplete?.();
    };
    return (
        <button
            type="button"
            class={`vauth-btn vauth-btn-${variant} ${props.className ?? ''}`}
            onClick={onClick}
            disabled={logout.loading}
            aria-busy={logout.loading}
        >
            {logout.loading ? 'Signing out…' : (props.label ?? 'Sign out')}
        </button>
    );
}
