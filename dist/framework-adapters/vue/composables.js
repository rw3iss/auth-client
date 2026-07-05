/**
 * Vue 3 composables — `useAuth`, `useUser`, etc. Return Vue reactive
 * refs / computed so templates can use them directly:
 *
 *   <script setup>
 *   import { useAuth } from '@vendidit/auth-client/vue';
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
import { computed, inject } from 'vue';
import { AUTH_INJECTION_KEY } from './plugin.js';
function getBundle() {
    const bundle = inject(AUTH_INJECTION_KEY);
    if (!bundle) {
        throw new Error('@vendidit/auth-client: useAuth requires app.use(AuthPlugin, { client })');
    }
    return bundle;
}
/**
 * Returns reactive computed refs for every snapshot field plus the
 * AuthClient itself. Templates can use these directly; reads inside
 * computed/watch tracks automatically.
 */
export function useAuth() {
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
export function useAuthClient() {
    return getBundle().client;
}
/** Just the user. */
export function useUser() {
    const { snapshot } = getBundle();
    return computed(() => snapshot.value.user);
}
/** Just the status. */
export function useAuthStatus() {
    const { snapshot } = getBundle();
    return computed(() => snapshot.value.status);
}
/** Just the ready flag. */
export function useAuthReady() {
    const { snapshot } = getBundle();
    return computed(() => snapshot.value.ready);
}
/** Convenience: authenticated boolean. */
export function useIsAuthenticated() {
    const { snapshot } = getBundle();
    return computed(() => snapshot.value.status === 'authenticated');
}
//# sourceMappingURL=composables.js.map