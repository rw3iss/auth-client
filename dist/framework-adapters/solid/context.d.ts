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
import { type Accessor, type JSX, type ParentProps } from 'solid-js';
import type { AuthClient } from '../../core/auth-client.js';
import type { AuthSnapshot } from '../../core/types.js';
interface AuthCtx {
    client: AuthClient;
    snapshot: Accessor<AuthSnapshot>;
}
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
export declare function AuthProvider(props: AuthProviderProps): JSX.Element;
/** Internal: read the full context. Adapters use this; consumers
 * usually want one of the public hooks (useAuth, useAuthClient). */
export declare function useAuthCtx(): AuthCtx;
/** Just the AuthClient — for invoking flow methods imperatively. */
export declare function useAuthClient(): AuthClient;
export {};
//# sourceMappingURL=context.d.ts.map