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

import { type ComputedRef, computed, inject } from 'vue';
import type { AuthClient } from '../../core/auth-client.js';
import type { AuthSnapshot, AuthStatus } from '../../core/types.js';
import { AUTH_INJECTION_KEY, type AuthBundle } from './plugin.js';

function getBundle(): AuthBundle {
    const bundle = inject(AUTH_INJECTION_KEY);
    if (!bundle) {
        throw new Error(
            '@rw3iss/auth-client: useAuth requires app.use(AuthPlugin, { client })',
        );
    }
    return bundle;
}

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
export function useAuth(): UseAuthResult {
    const { client, snapshot } = getBundle();
    return {
        snapshot: computed(() => snapshot.value),
        user: computed(() => snapshot.value.user),
        status: computed(() => snapshot.value.status),
        ready: computed(() => snapshot.value.ready),
        isAuthenticated: computed(() => snapshot.value.status === 'authenticated'),
        isImpersonating: computed(() => snapshot.value.isImpersonating),
        error: computed(() => snapshot.value.error),
        client,
    };
}

/** Just the AuthClient — for imperative use (event subscriptions, etc.). */
export function useAuthClient(): AuthClient {
    return getBundle().client;
}

/** Just the user. */
export function useUser(): ComputedRef<AuthSnapshot['user']> {
    const { snapshot } = getBundle();
    return computed(() => snapshot.value.user);
}

/** Just the status. */
export function useAuthStatus(): ComputedRef<AuthStatus> {
    const { snapshot } = getBundle();
    return computed(() => snapshot.value.status);
}

/** Just the ready flag. */
export function useAuthReady(): ComputedRef<boolean> {
    const { snapshot } = getBundle();
    return computed(() => snapshot.value.ready);
}

/** Convenience: authenticated boolean. */
export function useIsAuthenticated(): ComputedRef<boolean> {
    const { snapshot } = getBundle();
    return computed(() => snapshot.value.status === 'authenticated');
}
