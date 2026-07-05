/**
 * React state hooks. Subscribe to the AuthClient's snapshot via
 * useSyncExternalStore — the canonical React 18+ pattern for external
 * stores. No tearing, deterministic SSR, single render per change.
 *
 * useAuth() returns the full snapshot. Selector variants (useUser,
 * useStatus, useIsAuthenticated) project to a single field — the
 * useSyncExternalStore identity check skips re-renders when the
 * derived value is unchanged.
 */
import type { AuthClient } from '../../core/auth-client.js';
import type { AuthSnapshot, AuthStatus } from '../../core/types.js';
/**
 * Subscribe to the full auth snapshot. Returns the same object identity
 * until something changes — safe to destructure into deps arrays.
 *
 * @param explicitClient Bypass context lookup (rare; useful in tests
 *   or multi-instance apps).
 */
export declare function useAuth(explicitClient?: AuthClient): AuthSnapshot;
/** Convenience: just the user object. Null when logged out. */
export declare function useUser(explicitClient?: AuthClient): AuthSnapshot['user'];
/** Convenience: just the lifecycle status. */
export declare function useAuthStatus(explicitClient?: AuthClient): AuthStatus;
/** Convenience: boolean for the most common gate. */
export declare function useIsAuthenticated(explicitClient?: AuthClient): boolean;
/** Convenience: ready flag — false until bootstrap completes. */
export declare function useAuthReady(explicitClient?: AuthClient): boolean;
//# sourceMappingURL=hooks.d.ts.map