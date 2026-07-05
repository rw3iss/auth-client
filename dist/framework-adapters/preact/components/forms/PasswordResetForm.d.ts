import type { AuthClient } from '../../../../core/auth-client.js';
/**
 * Reset-password form, completing the flow started by the
 * "forgot password" email. Mount this on the route the reset email
 * links to (e.g. /auth/reset?token=...) and pass `token` from the URL.
 *
 * On success, the new password is set server-side; this form does NOT
 * automatically log the user in — they get a "now sign in" affordance.
 * Wire `onSuccess` to redirect to /login.
 */
export interface PasswordResetFormProps {
    /** The single-use token from the reset email link. */
    token: string;
    client?: AuthClient;
    onSuccess?: () => void;
    onError?: (err: Error) => void;
    /** Route the "Sign in" affordance points to on success. */
    loginHref?: string;
    className?: string;
}
export declare function PasswordResetForm(props: PasswordResetFormProps): import("preact").JSX.Element;
//# sourceMappingURL=PasswordResetForm.d.ts.map