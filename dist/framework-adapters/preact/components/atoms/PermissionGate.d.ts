/** @jsxImportSource preact */
import type { ComponentChildren } from 'preact';
import type { AuthClient } from '../../../../core/auth-client.js';
/**
 * Render children only if the current user has the requested
 * permission(s). Permission strings are `resource:action` codes
 * (e.g. "users:read", "orgs:members:invite") — matches the server's
 * permission catalog.
 *
 * Like RoleGate, `system_admin` always passes.
 */
export interface PermissionGateProps {
    children: ComponentChildren;
    anyOf?: string[];
    allOf?: string[];
    fallback?: ComponentChildren;
    client?: AuthClient;
}
export declare function PermissionGate(props: PermissionGateProps): import("preact").JSX.Element;
//# sourceMappingURL=PermissionGate.d.ts.map