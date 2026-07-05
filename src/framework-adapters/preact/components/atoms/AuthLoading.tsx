/** @jsxImportSource preact */
import type { ComponentChildren } from 'preact';
import { useAuthReady } from '../../hooks.js';
import type { AuthClient } from '../../../../core/auth-client.js';

/**
 * Renders `fallback` while the AuthClient is still bootstrapping
 * (first network call, token restore, /auth/me confirmation). After
 * the snapshot reports `ready === true`, renders children.
 *
 * Drop this inside your app shell so the first paint doesn't flash
 * the anonymous UI before the cached session restores.
 */
export interface AuthLoadingProps {
    children: ComponentChildren;
    /** What to render while loading. Default: a centered spinner. */
    fallback?: ComponentChildren;
    client?: AuthClient;
}

export function AuthLoading(props: AuthLoadingProps) {
    const ready = useAuthReady(props.client);
    if (!ready) {
        return <>{props.fallback ?? <DefaultSpinner />}</>;
    }
    return <>{props.children}</>;
}

function DefaultSpinner() {
    return (
        <div class="vauth-loading-spinner" role="status" aria-label="Loading">
            <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="13" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="60 30" stroke-linecap="round">
                    <animateTransform attributeName="transform" type="rotate" from="0 16 16" to="360 16 16" dur="1s" repeatCount="indefinite" />
                </circle>
            </svg>
        </div>
    );
}
