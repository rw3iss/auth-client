/** @jsxImportSource preact */
import type { ComponentChildren } from 'preact';
import { useAuth } from '../../hooks.js';
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

export function GuestOnly(props: GuestOnlyProps) {
    const snap = useAuth(props.client);
    // While bootstrap is in flight we can already see status: anonymous
    // when there's no cached token, so optimistically render children
    // for header / nav chrome — the worst case is a sub-second flash if
    // we later resolve to authenticated, which the cross-fade hides.
    // Callers that genuinely need to gate on `ready` should pass an
    // explicit `loading` slot.
    if (!snap.ready && props.loading !== undefined) {
        return <>{props.loading}</>;
    }
    if (snap.status === 'authenticated') {
        return <>{props.fallback ?? null}</>;
    }
    return <>{props.children}</>;
}
