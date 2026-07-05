import type { AuthClient } from '../../../../core/auth-client.js';
import type { AuthResponse } from '../../../../core/types.js';
/**
 * Admin impersonation start-form: pick a user id, supply a reason,
 * issue impersonation tokens. The current session is replaced with
 * the impersonation token-pair; downstream UI reacts via the auth
 * snapshot.
 *
 * Reads `isImpersonating` from the snapshot so a re-mount after the
 * impersonation starts renders the "exit impersonation" panel. The
 * exit affordance fires `logoutCurrent()` which clears the
 * impersonation token; the admin's original session does NOT
 * automatically restore — that's by design (server-side, impersonation
 * is a fresh session, not a stack push). Admins re-login after.
 *
 * Required permission: `system_admin`, `super_admin`, or an `org_admin`
 * impersonating a user in their own org. Server enforces; this UI
 * shows the server's 403 message verbatim.
 */
export interface CompleteImpersonationFlowProps {
    client?: AuthClient;
    onStarted?: (resp: AuthResponse) => void;
    className?: string;
}
export declare function CompleteImpersonationFlow(props: CompleteImpersonationFlowProps): import("preact").JSX.Element;
//# sourceMappingURL=CompleteImpersonationFlow.d.ts.map