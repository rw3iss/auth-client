/**
 * Solid accessor hooks. Each returns an Accessor — call it to read the
 * current value reactively within a Solid component / effect.
 *
 *   const { user, ready } = useAuth();
 *   <Show when={ready()}>
 *     {user() ? <Dashboard /> : <Login />}
 *   </Show>
 */

import { type Accessor, createMemo } from 'solid-js';
import type { AuthSnapshot, AuthStatus } from '../../core/types.js';
import { useAuthCtx } from './context.js';

export interface UseAuthResult {
    /** Full snapshot accessor. */
    snapshot: Accessor<AuthSnapshot>;
    /** Current user (id + email) or null. */
    user: Accessor<AuthSnapshot['user']>;
    /** Lifecycle status. */
    status: Accessor<AuthStatus>;
    /** True once bootstrap has completed. */
    ready: Accessor<boolean>;
    /** Shorthand: status === 'authenticated'. */
    isAuthenticated: Accessor<boolean>;
    /** True when the current session is an impersonation. */
    isImpersonating: Accessor<boolean>;
    /** Last error from a flow that surfaced it on the snapshot. */
    error: Accessor<Error | null>;
}

/**
 * Returns reactive accessors for every field of the auth snapshot.
 * Solid's fine-grained reactivity means reading a single field
 * (e.g. user()) only triggers that field's dependents.
 */
export function useAuth(): UseAuthResult {
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
export function useUser(): Accessor<AuthSnapshot['user']> {
    const { snapshot } = useAuthCtx();
    return createMemo(() => snapshot().user);
}

/** Convenience: just the status. */
export function useAuthStatus(): Accessor<AuthStatus> {
    const { snapshot } = useAuthCtx();
    return createMemo(() => snapshot().status);
}

/** Convenience: ready flag. */
export function useAuthReady(): Accessor<boolean> {
    const { snapshot } = useAuthCtx();
    return createMemo(() => snapshot().ready);
}

/** Convenience: authenticated boolean. */
export function useIsAuthenticated(): Accessor<boolean> {
    const { snapshot } = useAuthCtx();
    return createMemo(() => snapshot().status === 'authenticated');
}
