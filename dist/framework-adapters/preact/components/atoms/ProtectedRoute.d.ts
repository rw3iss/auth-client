/** @jsxImportSource preact */
import type { ComponentChildren } from 'preact';
import type { AuthClient } from '../../../../core/auth-client.js';
/**
 * Render children only if the caller is authenticated. While the
 * AuthClient is still bootstrapping, renders the `loading` fallback
 * (default: an inline `<AuthLoading/>`-style placeholder).
 *
 * Anonymous state renders the `fallback` — typically a redirect
 * component from your router, or an inline "please sign in" view.
 * The component itself does not navigate; that's a router concern.
 *
 * Usage:
 *   <ProtectedRoute fallback={<Navigate to="/login" />}>
 *     <Dashboard />
 *   </ProtectedRoute>
 */
export interface ProtectedRouteProps {
    children: ComponentChildren;
    /** Rendered when the user is anonymous / offline / session expired. */
    fallback?: ComponentChildren;
    /** Rendered while AuthClient is still bootstrapping. */
    loading?: ComponentChildren;
    client?: AuthClient;
}
export declare function ProtectedRoute(props: ProtectedRouteProps): import("preact").JSX.Element;
//# sourceMappingURL=ProtectedRoute.d.ts.map