/**
 * Preact context for the AuthClient instance. Mirrors the React adapter
 * verbatim — only the imports change (preact + preact/hooks instead of
 * react). Maintained as a parallel implementation rather than a shared
 * file because: (a) the two are tiny, (b) keeping them independent
 * means a Preact-only project doesn't need React types in node_modules.
 */
/** @jsxImportSource preact */
import { type ComponentChildren } from 'preact';
import type { AuthClient } from '../../core/auth-client.js';
export interface AuthProviderProps {
    /** The AuthClient instance, typically constructed once at app boot. */
    client: AuthClient;
    /** Tear down the AuthClient on Provider unmount. Default false. */
    destroyOnUnmount?: boolean;
    children: ComponentChildren;
}
export declare function AuthProvider(props: AuthProviderProps): import("preact").JSX.Element;
export declare function useAuthClient(): AuthClient;
//# sourceMappingURL=context.d.ts.map