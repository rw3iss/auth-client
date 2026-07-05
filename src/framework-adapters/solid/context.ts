/**
 * SolidJS context for the AuthClient. Solid's fine-grained reactivity
 * makes the adapter shape a bit different from React's:
 *
 *   - The snapshot lives in a Solid signal so reads are reactive
 *     automatically (no useSyncExternalStore-equivalent needed).
 *   - The AuthProvider component owns the subscribe/unsubscribe
 *     lifecycle via onCleanup.
 *   - Hooks return accessor functions (the Solid idiom) rather than
 *     plain values — `user()` not `user`. Components inside JSX work
 *     naturally with this.
 *
 * Why no JSX here?
 *
 * Solid JSX requires babel-plugin-solid at build time — tsc cannot
 * compile Solid JSX. The plain-call form below is exactly what
 * babel-plugin-solid emits for `<Context.Provider value={…}>{…}</…>`.
 * Using createComponent + getters means the SDK ships with tsc only —
 * consumers don't need to thread the Solid babel plugin through their
 * build for this file.
 */

import {
    type Accessor,
    createComponent,
    createContext,
    createSignal,
    type JSX,
    onCleanup,
    onMount,
    type ParentProps,
    useContext,
} from 'solid-js';
import type { AuthClient } from '../../core/auth-client.js';
import type { AuthSnapshot } from '../../core/types.js';

interface AuthCtx {
    client: AuthClient;
    snapshot: Accessor<AuthSnapshot>;
}

const AuthClientContext = createContext<AuthCtx | null>(null);

export interface AuthProviderProps extends ParentProps {
    /** The AuthClient instance, typically created once at app boot. */
    client: AuthClient;
    /** Tear down the client on cleanup. Default false. */
    destroyOnUnmount?: boolean;
}

/**
 * AuthProvider — wrap your app root inside Solid's createRoot.
 *
 *   <AuthProvider client={authClient}>
 *     <App />
 *   </AuthProvider>
 */
export function AuthProvider(props: AuthProviderProps): JSX.Element {
    const [snapshot, setSnapshot] = createSignal<AuthSnapshot>(props.client.getSnapshot());

    onMount(() => {
        const unsubscribe = props.client.subscribe((s) => setSnapshot(s));
        onCleanup(() => {
            unsubscribe();
            if (props.destroyOnUnmount) {
                props.client.destroy();
            }
        });
    });

    // Equivalent to:
    //   <AuthClientContext.Provider value={{client: props.client, snapshot}}>
    //     {props.children}
    //   </AuthClientContext.Provider>
    //
    // The getter form on `value` is the canonical Solid pattern for
    // props that depend on reactive sources — props are reactive in
    // Solid, so the getter re-reads on track. `props.client` is stable
    // here so we could inline; the getter form is documentation as much
    // as anything.
    return createComponent(AuthClientContext.Provider, {
        get value(): AuthCtx {
            return { client: props.client, snapshot };
        },
        get children(): JSX.Element {
            return props.children;
        },
    });
}

/** Internal: read the full context. Adapters use this; consumers
 * usually want one of the public hooks (useAuth, useAuthClient). */
export function useAuthCtx(): AuthCtx {
    const ctx = useContext(AuthClientContext);
    if (!ctx) {
        throw new Error(
            '@vendidit/auth-client: useAuthClient must be used inside an <AuthProvider>',
        );
    }
    return ctx;
}

/** Just the AuthClient — for invoking flow methods imperatively. */
export function useAuthClient(): AuthClient {
    return useAuthCtx().client;
}
