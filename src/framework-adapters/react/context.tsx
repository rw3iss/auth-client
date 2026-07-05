/**
 * React Context for the AuthClient instance.
 *
 * The pattern is the standard React DI shape: one Provider at app root,
 * hooks read from context. Consumers can opt out of the Provider and
 * call hooks with an explicit client argument when they want to wire
 * up multiple isolated AuthClients in the same tree (e.g., marketplace
 * + admin running in one app).
 */

import {
    createContext,
    createElement,
    type ReactNode,
    useContext,
    useEffect,
} from 'react';
import type { AuthClient } from '../../core/auth-client.js';

const AuthClientContext = createContext<AuthClient | null>(null);

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
export function AuthProvider(props: AuthProviderProps): ReactNode {
    const { client, destroyOnUnmount = false, children } = props;
    useEffect(() => {
        if (!destroyOnUnmount) return;
        return () => {
            client.destroy();
        };
    }, [client, destroyOnUnmount]);
    return createElement(AuthClientContext.Provider, { value: client }, children);
}

/**
 * Read the AuthClient from context. Throws when called outside an
 * AuthProvider — that's almost certainly a bug, so we surface it loudly
 * rather than returning null.
 *
 * Hooks that take an explicit client (useAuth(client)) bypass this and
 * use the supplied instance — useful in tests + multi-instance apps.
 */
export function useAuthClient(): AuthClient {
    const client = useContext(AuthClientContext);
    if (!client) {
        throw new Error(
            '@vendidit/auth-client: useAuthClient must be used inside an <AuthProvider>',
        );
    }
    return client;
}

/** Internal helper for hooks that accept an optional explicit client. */
export function resolveClient(explicit: AuthClient | undefined): AuthClient {
    if (explicit) return explicit;
    return useAuthClient();
}
