/**
 * React Context for the AuthClient instance.
 *
 * The pattern is the standard React DI shape: one Provider at app root,
 * hooks read from context. Consumers can opt out of the Provider and
 * call hooks with an explicit client argument when they want to wire
 * up multiple isolated AuthClients in the same tree (e.g., marketplace
 * + admin running in one app).
 */
import { type ReactNode } from 'react';
import type { AuthClient } from '../../core/auth-client.js';
export interface AuthProviderProps {
    /** The AuthClient instance. Typically created once at app boot. */
    client: AuthClient;
    /** When true, the SDK is torn down (destroy()) on Provider unmount.
     * Default false — consumers usually want the client to outlive any
     * single React tree (e.g., during HMR reloads in dev). */
    destroyOnUnmount?: boolean;
    children: ReactNode;
}
/**
 * Provider — wrap your app root.
 *
 *   <AuthProvider client={authClient}>
 *     <App />
 *   </AuthProvider>
 */
export declare function AuthProvider(props: AuthProviderProps): ReactNode;
/**
 * Read the AuthClient from context. Throws when called outside an
 * AuthProvider — that's almost certainly a bug, so we surface it loudly
 * rather than returning null.
 *
 * Hooks that take an explicit client (useAuth(client)) bypass this and
 * use the supplied instance — useful in tests + multi-instance apps.
 */
export declare function useAuthClient(): AuthClient;
/** Internal helper for hooks that accept an optional explicit client. */
export declare function resolveClient(explicit: AuthClient | undefined): AuthClient;
//# sourceMappingURL=context.d.ts.map