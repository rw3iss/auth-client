import type { AuthClient } from '../../../../core/auth-client.js';
import type { AuthResponse } from '../../../../core/types.js';
/**
 * Full registration flow: collect details → register → display
 * post-signup "check your email" notice. Composes RegisterForm +
 * SsoButtonGroup (for sign-up-via-SSO) + EmailVerificationNotice.
 *
 * After a successful register, the AuthClient is already signed in
 * (the server returns a token pair). The verification step is
 * advisory — most apps treat unverified accounts as functional but
 * gate certain actions on verification.
 */
export interface CompleteSignupFlowProps {
    client?: AuthClient;
    ssoRedirectUrl?: string;
    loginHref?: string;
    onSuccess?: (resp: AuthResponse) => void;
    className?: string;
}
export declare function CompleteSignupFlow(props: CompleteSignupFlowProps): import("preact").JSX.Element;
//# sourceMappingURL=CompleteSignupFlow.d.ts.map