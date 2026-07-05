import { jsx as _jsx } from "preact/jsx-runtime";
/**
 * Preact context for the AuthClient instance. Mirrors the React adapter
 * verbatim — only the imports change (preact + preact/hooks instead of
 * react). Maintained as a parallel implementation rather than a shared
 * file because: (a) the two are tiny, (b) keeping them independent
 * means a Preact-only project doesn't need React types in node_modules.
 */
/** @jsxImportSource preact */
import { createContext } from 'preact';
import { useContext, useEffect } from 'preact/hooks';
const AuthClientContext = createContext(null);
export function AuthProvider(props) {
    const { client, destroyOnUnmount = false, children } = props;
    useEffect(() => {
        if (!destroyOnUnmount)
            return;
        return () => {
            client.destroy();
        };
    }, [client, destroyOnUnmount]);
    return (_jsx(AuthClientContext.Provider, { value: client, children: children }));
}
export function useAuthClient() {
    const client = useContext(AuthClientContext);
    if (!client) {
        throw new Error('@vendidit/auth-client: useAuthClient must be used inside an <AuthProvider>');
    }
    return client;
}
//# sourceMappingURL=context.js.map