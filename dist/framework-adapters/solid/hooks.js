/**
 * Solid accessor hooks. Each returns an Accessor — call it to read the
 * current value reactively within a Solid component / effect.
 *
 *   const { user, ready } = useAuth();
 *   <Show when={ready()}>
 *     {user() ? <Dashboard /> : <Login />}
 *   </Show>
 */
import { createMemo } from 'solid-js';
import { useAuthCtx } from './context.js';
/**
 * Returns reactive accessors for every field of the auth snapshot.
 * Solid's fine-grained reactivity means reading a single field
 * (e.g. user()) only triggers that field's dependents.
 */
export function useAuth() {
    const { snapshot } = useAuthCtx();
    return {
        snapshot,
        user: createMemo(() => snapshot().user),
        status: createMemo(() => snapshot().status),
        ready: createMemo(() => snapshot().ready),
        isAuthenticated: createMemo(() => snapshot().status === 'authenticated'),
        isImpersonating: createMemo(() => snapshot().isImpersonating),
        error: createMemo(() => snapshot().error),
    };
}
/** Convenience: just the user. */
export function useUser() {
    const { snapshot } = useAuthCtx();
    return createMemo(() => snapshot().user);
}
/** Convenience: just the status. */
export function useAuthStatus() {
    const { snapshot } = useAuthCtx();
    return createMemo(() => snapshot().status);
}
/** Convenience: ready flag. */
export function useAuthReady() {
    const { snapshot } = useAuthCtx();
    return createMemo(() => snapshot().ready);
}
/** Convenience: authenticated boolean. */
export function useIsAuthenticated() {
    const { snapshot } = useAuthCtx();
    return createMemo(() => snapshot().status === 'authenticated');
}
//# sourceMappingURL=hooks.js.map