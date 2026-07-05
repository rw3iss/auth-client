/**
 * Vue 3 composables — `useAuth`, `useUser`, etc. Return Vue reactive
 * refs / computed so templates can use them directly:
 *
 *   <script setup>
 *   import { useAuth } from '@rw3iss/auth-client/vue';
 *   const { user, ready, status } = useAuth();
 *   </script>
 *
 *   <template>
 *     <Splash v-if="!ready" />
 *     <Dashboard v-else-if="user" :user="user" />
 *     <Login v-else />
 *   </template>
 *
 * Internally every composable derives from the single snapshot ref the
 * plugin installs at provide() time.
 */
import { type ComputedRef } from 'vue';
import type { AuthClient } from '../../core/auth-client.js';
import type { AuthSnapshot, AuthStatus } from '../../core/types.js';
export interface UseAuthResult {
    snapshot: ComputedRef<AuthSnapshot>;
    user: ComputedRef<AuthSnapshot['user']>;
    status: ComputedRef<AuthStatus>;
    ready: ComputedRef<boolean>;
    isAuthenticated: ComputedRef<boolean>;
    isImpersonating: ComputedRef<boolean>;
    error: ComputedRef<Error | null>;
    /** Direct access to the AuthClient for imperative flow calls. */
    client: AuthClient;
}
/**
 * Returns reactive computed refs for every snapshot field plus the
 * AuthClient itself. Templates can use these directly; reads inside
 * computed/watch tracks automatically.
 */
export declare function useAuth(): UseAuthResult;
/** Just the AuthClient — for imperative use (event subscriptions, etc.). */
export declare function useAuthClient(): AuthClient;
/** Just the user. */
export declare function useUser(): ComputedRef<AuthSnapshot['user']>;
/** Just the status. */
export declare function useAuthStatus(): ComputedRef<AuthStatus>;
/** Just the ready flag. */
export declare function useAuthReady(): ComputedRef<boolean>;
/** Convenience: authenticated boolean. */
export declare function useIsAuthenticated(): ComputedRef<boolean>;
//# sourceMappingURL=composables.d.ts.map