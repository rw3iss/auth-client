import type { AuthClient } from '../../../../core/auth-client.js';
import type { AuthResponse } from '../../../../core/types.js';
/**
 * "Sign in" page — opinionated composition of:
 *   - SsoButtonGroup (all four built-in providers)
 *   - A subtle divider
 *   - LoginForm (with the 2FA prompt path built in)
 *   - "No account? Sign up →" affordance below
 *
 * Drop in your /login route. For more control, render LoginForm +
 * SsoButtonGroup yourself.
 */
export interface CompleteLoginFlowProps {
    client?: AuthClient;
    /** Where to redirect SSO callbacks. Default: `${origin}/auth/callback`. */
    ssoRedirectUrl?: string;
    forgotPasswordHref?: string;
    registerHref?: string;
    onSuccess?: (resp: AuthResponse) => void;
    className?: string;
}
export declare function CompleteLoginFlow(props: CompleteLoginFlowProps): import("preact").JSX.Element;
//# sourceMappingURL=CompleteLoginFlow.d.ts.map