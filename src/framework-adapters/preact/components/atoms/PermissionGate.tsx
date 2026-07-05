/** @jsxImportSource preact */
import type { ComponentChildren } from 'preact';
import { useAuth } from '../../hooks.js';
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

export function PermissionGate(props: PermissionGateProps) {
    const snap = useAuth(props.client);
    const perms = snap.claims?.permissions ?? [];
    const roles = snap.claims?.roles ?? [];
    if (roles.includes('system_admin')) return <>{props.children}</>;
    const allowed =
        (!props.anyOf || props.anyOf.some((p) => perms.includes(p))) &&
        (!props.allOf || props.allOf.every((p) => perms.includes(p)));
    if (!allowed) return <>{props.fallback ?? null}</>;
    return <>{props.children}</>;
}
