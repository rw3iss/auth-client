/** @jsxImportSource preact */
import type { ComponentChildren } from 'preact';
import type { AuthClient } from '../../../../core/auth-client.js';
/**
 * Render children only if the current user has one of the listed
 * roles. Reads `user.roles` from the AuthClient snapshot — no extra
 * network call. The role names match the role-code strings on the
 * server (e.g. "system_admin", "super_admin", "org_admin").
 *
 * Special-case: a `system_admin` user always passes (mirrors the
 * server-side gate which treats system_admin as a universal bypass).
 *
 * Usage:
 *   <RoleGate anyOf={['system_admin', 'super_admin']}>
 *     <AdminPanel />
 *   </RoleGate>
 */
export interface RoleGateProps {
    children: ComponentChildren;
    anyOf?: string[];
    allOf?: string[];
    fallback?: ComponentChildren;
    client?: AuthClient;
}
export declare function RoleGate(props: RoleGateProps): import("preact").JSX.Element;
//# sourceMappingURL=RoleGate.d.ts.map