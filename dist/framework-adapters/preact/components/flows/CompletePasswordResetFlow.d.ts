import type { AuthClient } from '../../../../core/auth-client.js';
/**
 * Combined password-reset surface — branches on whether a token was
 * provided:
 *
 *   - No token → renders the "send me a reset link" request form.
 *   - Token present → renders the new-password form that completes
 *     the reset.
 *
 * Mount this on a single /auth/reset route and pass `token` from the
 * URL search params. The router can keep one route handler instead of
 * two.
 */
export interface CompletePasswordResetFlowProps {
    client?: AuthClient;
    /** Reset token from the email link, if present. */
    token?: string;
    loginHref?: string;
    className?: string;
}
export declare function CompletePasswordResetFlow(props: CompletePasswordResetFlowProps): import("preact").JSX.Element;
//# sourceMappingURL=CompletePasswordResetFlow.d.ts.map