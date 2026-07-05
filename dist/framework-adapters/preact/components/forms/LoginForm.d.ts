import type { ComponentChildren } from 'preact';
import type { AuthClient } from '../../../../core/auth-client.js';
import type { AuthResponse } from '../../../../core/types.js';
/**
 * Password login form. Handles the full credential-submit lifecycle:
 *   - Email + password fields
 *   - Optional "remember me" checkbox
 *   - Surfaces server errors (rate limit, invalid creds, 2FA-required)
 *   - If the server returns `requires_2fa`, swaps in the TOTP code field
 *     and re-submits with the second factor.
 *
 * Slots:
 *   - `forgotPasswordHref` — link rendered next to the password input
 *   - `belowSubmit` — slot for SSO buttons, "create account" link, etc.
 *
 * On success: calls `onSuccess(authResponse)` and the AuthClient's
 * snapshot transitions to `authenticated` (your `<ProtectedRoute>` /
 * `<GuestOnly>` wrappers will react automatically).
 */
export interface LoginFormProps {
    client?: AuthClient;
    /** Pre-fill the email field (e.g. from a magic link). */
    defaultEmail?: string;
    /** Where the "Forgot password?" link points. Hide by omitting. */
    forgotPasswordHref?: string;
    /** Slot rendered under the submit button — typically the SSO group. */
    belowSubmit?: ComponentChildren;
    /** Slot rendered above the form. */
    aboveForm?: ComponentChildren;
    onSuccess?: (resp: AuthResponse) => void;
    onError?: (err: Error) => void;
    organizationId?: string;
    className?: string;
}
export declare function LoginForm(props: LoginFormProps): import("preact").JSX.Element;
//# sourceMappingURL=LoginForm.d.ts.map