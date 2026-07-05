import type { AuthClient } from '../../../../core/auth-client.js';
/**
 * Single-page "Account security" surface — drops change-password, 2FA
 * management, session list, and logout-all into one organized view.
 * Suitable for /settings/security.
 *
 * The 2FA section auto-toggles based on the user's current state
 * (claims.two_factor_enabled isn't on the token by design, so we
 * approximate via the presence of a session_id claim — refine with
 * a /whoami call if you need exact state).
 */
export interface CompleteAccountSecurityFlowProps {
    client?: AuthClient;
    /** Render the impersonation banner if the caller is impersonating. */
    showImpersonationBanner?: boolean;
    className?: string;
}
export declare function CompleteAccountSecurityFlow(props: CompleteAccountSecurityFlowProps): import("preact").JSX.Element | null;
//# sourceMappingURL=CompleteAccountSecurityFlow.d.ts.map