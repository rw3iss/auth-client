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
export declare function LogoutAllButton(props: LogoutAllButtonProps): import("preact").JSX.Element;
//# sourceMappingURL=LogoutAllButton.d.ts.map