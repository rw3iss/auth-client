/** @jsxImportSource preact */
import type { ComponentChildren } from 'preact';
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
export declare function AuthLoading(props: AuthLoadingProps): import("preact").JSX.Element;
//# sourceMappingURL=AuthLoading.d.ts.map