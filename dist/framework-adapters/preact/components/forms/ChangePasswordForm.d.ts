import type { AuthClient } from '../../../../core/auth-client.js';
/**
 * Change-password form for the currently-signed-in user. Authenticated
 * flow; the server requires the current password as a re-auth defense.
 *
 * After success, the caller's existing tokens remain valid (the
 * server doesn't bump the token-version on a password change unless
 * the caller follows up with `logoutAll()`). Render a
 * `<LogoutAllButton>` near this form so users can opt to terminate
 * other devices after the rotation.
 */
export interface ChangePasswordFormProps {
    client?: AuthClient;
    onSuccess?: () => void;
    onError?: (err: Error) => void;
    className?: string;
}
export declare function ChangePasswordForm(props: ChangePasswordFormProps): import("preact").JSX.Element;
//# sourceMappingURL=ChangePasswordForm.d.ts.map