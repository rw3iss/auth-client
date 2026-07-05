/**
 * Preact context for the AuthClient instance. Mirrors the React adapter
 * verbatim — only the imports change (preact + preact/hooks instead of
 * react). Maintained as a parallel implementation rather than a shared
 * file because: (a) the two are tiny, (b) keeping them independent
 * means a Preact-only project doesn't need React types in node_modules.
 */

/** @jsxImportSource preact */
import { createContext, type ComponentChildren } from 'preact';
import { useContext, useEffect } from 'preact/hooks';
import type { AuthClient } from '../../core/auth-client.js';

const AuthClientContext = createContext<AuthClient | null>(null);

export interface AuthProviderProps {
    /** The AuthClient instance, typically constructed once at app boot. */
    client: AuthClient;
    /** Tear down the AuthClient on Provider unmount. Default false. */
    destroyOnUnmount?: boolean;
    children: ComponentChildren;
}

export function AuthProvider(props: AuthProviderProps) {
    const { client, destroyOnUnmount = false, children } = props;
    useEffect(() => {
        if (!destroyOnUnmount) return;
        return () => {
            client.destroy();
        };
    }, [client, destroyOnUnmount]);
    return (
        <AuthClientContext.Provider value={client}>{children}</AuthClientContext.Provider>
    );
}

export function useAuthClient(): AuthClient {
    const client = useContext(AuthClientContext);
    if (!client) {
        throw new Error(
            '@vendidit/auth-client: useAuthClient must be used inside an <AuthProvider>',
        );
    }
    return client;
}
