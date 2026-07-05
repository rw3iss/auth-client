import type { ComponentChildren } from 'preact';
import type { AuthClient } from '../../../../core/auth-client.js';
/**
 * Email-verification landing — mount on the route your verification
 * emails link to (the server builds `{appFrontendURL}/auth/verify-email
 * ?token=...` from the app's `frontend_url`). Reads the token from the
 * URL (or the `token` prop), exchanges it via /auth/verify-email on
 * mount, and renders one of four states:
 *
 *   - verifying → `loadingSlot` (default: quiet status line)
 *   - success   → confirmation + optional `continueHref` link
 *   - error     → `renderError` override or inline alert
 *   - missing   → no token in the URL (bad / truncated link)
 *
 * Stateless about navigation: pass `onSuccess` to redirect, or let the
 * user click through via `continueHref`.
 */
export interface CompleteEmailVerificationFlowProps {
    client?: AuthClient;
    /** Verification token. Default: `?token=` from the current URL. */
    token?: string;
    /** Called once after a successful verification. */
    onSuccess?: () => void;
    onError?: (err: Error) => void;
    /** Where the success (and missing-token) states link to, e.g. "/sign-in". */
    continueHref?: string;
    /** Label for the continue link. Default "Continue to sign in". */
    continueLabel?: string;
    /** Override the in-flight display. Default: quiet status line. */
    loadingSlot?: ComponentChildren;
    /** Override the error display. Default: inline alert + continue link. */
    renderError?: (err: Error) => ComponentChildren;
    className?: string;
}
export declare function CompleteEmailVerificationFlow(props: CompleteEmailVerificationFlowProps): import("preact").JSX.Element;
//# sourceMappingURL=CompleteEmailVerificationFlow.d.ts.map