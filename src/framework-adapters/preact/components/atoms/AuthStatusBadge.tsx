/** @jsxImportSource preact */
import { useAuth } from '../../hooks.js';
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

export function AuthStatusBadge(props: AuthStatusBadgeProps) {
    const snap = useAuth(props.client);
    const status = snap.status;
    const label =
        status === 'authenticated' ? 'Signed in' :
        status === 'anonymous' ? 'Signed out' :
        status === 'offline' ? 'Offline' :
        'Loading…';
    return (
        <span
            class={`vauth-status-badge vauth-status-${status} ${props.className ?? ''}`}
            data-status={status}
        >
            <span class="vauth-status-dot" aria-hidden="true" />
            {label}
        </span>
    );
}
