/** @jsxImportSource preact */
import type { ComponentChildren } from 'preact';
import type { AuthClient } from '../../../../core/auth-client.js';
/**
 * Inverse of ProtectedRoute — render children only when NOT
 * authenticated. Useful for /login and /register pages that should
 * redirect away when an authenticated user lands on them.
 */
export interface GuestOnlyProps {
    children: ComponentChildren;
    /** Rendered when the user is authenticated. */
    fallback?: ComponentChildren;
    loading?: ComponentChildren;
    client?: AuthClient;
}
export declare function GuestOnly(props: GuestOnlyProps): import("preact").JSX.Element;
//# sourceMappingURL=GuestOnly.d.ts.map