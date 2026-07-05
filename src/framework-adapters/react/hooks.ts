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

import { useSyncExternalStore } from 'react';
import type { AuthClient } from '../../core/auth-client.js';
import type { AuthSnapshot, AuthStatus } from '../../core/types.js';
import { useAuthClient } from './context.js';

/**
 * Subscribe to the full auth snapshot. Returns the same object identity
 * until something changes — safe to destructure into deps arrays.
 *
 * @param explicitClient Bypass context lookup (rare; useful in tests
 *   or multi-instance apps).
 */
export function useAuth(explicitClient?: AuthClient): AuthSnapshot {
    // Hooks rules: useAuthClient may run inside the Selector overload
    // path too; React allows nested hook calls within a single render.
    const ctxClient = useAuthClient();
    const client = explicitClient ?? ctxClient;
    return useSyncExternalStore(
        client.subscribe.bind(client),
        client.getSnapshot.bind(client),
        // Server snapshot: pre-bootstrap state. Avoids hydration mismatch
        // when the app uses SSR.
        client.getSnapshot.bind(client),
    );
}

/** Convenience: just the user object. Null when logged out. */
export function useUser(explicitClient?: AuthClient): AuthSnapshot['user'] {
    return useAuth(explicitClient).user;
}

/** Convenience: just the lifecycle status. */
export function useAuthStatus(explicitClient?: AuthClient): AuthStatus {
    return useAuth(explicitClient).status;
}

/** Convenience: boolean for the most common gate. */
export function useIsAuthenticated(explicitClient?: AuthClient): boolean {
    return useAuth(explicitClient).status === 'authenticated';
}

/** Convenience: ready flag — false until bootstrap completes. */
export function useAuthReady(explicitClient?: AuthClient): boolean {
    return useAuth(explicitClient).ready;
}
