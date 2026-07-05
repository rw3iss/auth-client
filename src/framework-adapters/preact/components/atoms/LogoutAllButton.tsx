/** @jsxImportSource preact */
import { useLogoutAll } from '../../actions.js';
import type { AuthClient } from '../../../../core/auth-client.js';

/**
 * Sign out of every session on every device for the current user.
 * Calls /auth/logout/all which both revokes every refresh token in the
 * DB AND bumps the per-user token-version (so outstanding access
 * tokens fail validation cross-replica within ~one cache miss). Use
 * after a credential compromise.
 */
export interface LogoutAllButtonProps {
    client?: AuthClient;
    label?: string;
    onComplete?: () => void;
    className?: string;
    variant?: 'primary' | 'ghost' | 'danger';
    /** Show a confirmation prompt before firing. Default true. */
    confirm?: boolean;
}

export function LogoutAllButton(props: LogoutAllButtonProps) {
    const logoutAll = useLogoutAll(props.client);
    const variant = props.variant ?? 'danger';
    const onClick = async () => {
        if (props.confirm !== false) {
            const ok = typeof window !== 'undefined'
                ? window.confirm('Sign out of every device? You will be signed out everywhere immediately.')
                : true;
            if (!ok) return;
        }
        await logoutAll.run();
        props.onComplete?.();
    };
    return (
        <button
            type="button"
            class={`vauth-btn vauth-btn-${variant} ${props.className ?? ''}`}
            onClick={onClick}
            disabled={logoutAll.loading}
            aria-busy={logoutAll.loading}
        >
            {logoutAll.loading ? 'Signing out everywhere…' : (props.label ?? 'Sign out of all devices')}
        </button>
    );
}
