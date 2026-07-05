/**
 * Solid accessor hooks. Each returns an Accessor — call it to read the
 * current value reactively within a Solid component / effect.
 *
 *   const { user, ready } = useAuth();
 *   <Show when={ready()}>
 *     {user() ? <Dashboard /> : <Login />}
 *   </Show>
 */
import { type Accessor } from 'solid-js';
import type { AuthSnapshot, AuthStatus } from '../../core/types.js';
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
export declare function useAuth(): UseAuthResult;
/** Convenience: just the user. */
export declare function useUser(): Accessor<AuthSnapshot['user']>;
/** Convenience: just the status. */
export declare function useAuthStatus(): Accessor<AuthStatus>;
/** Convenience: ready flag. */
export declare function useAuthReady(): Accessor<boolean>;
/** Convenience: authenticated boolean. */
export declare function useIsAuthenticated(): Accessor<boolean>;
//# sourceMappingURL=hooks.d.ts.map