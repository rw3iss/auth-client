import type { AuthClient } from '../../../../core/auth-client.js';
/**
 * "Forgot your password?" form. Anonymous flow — does not require a
 * session. On submit, POST /auth/password/reset-request. The server
 * always responds 200 regardless of whether the email is registered
 * (anti-enumeration), so the success state simply tells the user to
 * check their inbox.
 */
export interface PasswordResetRequestFormProps {
    client?: AuthClient;
    /** Pre-fill from a query param (?email=...). */
    defaultEmail?: string;
    /** Override the success message. */
    successMessage?: string;
    onSuccess?: () => void;
    onError?: (err: Error) => void;
    className?: string;
}
export declare function PasswordResetRequestForm(props: PasswordResetRequestFormProps): import("preact").JSX.Element;
//# sourceMappingURL=PasswordResetRequestForm.d.ts.map