import type { AuthClient } from '../../../../core/auth-client.js';
/**
 * Tiny pill rendering the current auth status. Drives entirely off the
 * AuthClient snapshot — no extra state — so it stays in sync across the
 * app and across tabs.
 *
 * Usage:
 *   <AuthStatusBadge />
 *
 * Theming via CSS variables on `.vauth-status-badge`. Reads
 *   --vauth-color-success, --vauth-color-warn, --vauth-color-muted
 * from the surrounding scope.
 */
export interface AuthStatusBadgeProps {
    /** Optional override; defaults to the AuthProvider-supplied client. */
    client?: AuthClient;
    /** Extra className(s) to merge. */
    className?: string;
}
export declare function AuthStatusBadge(props: AuthStatusBadgeProps): import("preact").JSX.Element;
//# sourceMappingURL=AuthStatusBadge.d.ts.map