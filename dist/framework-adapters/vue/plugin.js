/**
 * Vue 3 plugin + provide/inject DI.
 *
 *   import { createApp } from 'vue';
 *   import { createAuthClient } from '@rw3iss/auth-client';
 *   import { AuthPlugin } from '@rw3iss/auth-client/vue';
 *
 *   const client = createAuthClient({...});
 *   createApp(App).use(AuthPlugin, { client }).mount('#app');
 *
 * The plugin sets up two things:
 *   1. A reactive ref<AuthSnapshot> that mirrors the client's snapshot.
 *   2. provide() of the client + reactive ref under known injection keys.
 *
 * The reactive ref lives at the app level (one per app.use()) so
 * `useAuth()` returns the same instance from anywhere in the tree
 * without prop drilling.
 */
import { ref } from 'vue';
export const AUTH_INJECTION_KEY = Symbol.for('@rw3iss/auth-client:vue');
/** Vue plugin object. Registered via `app.use(AuthPlugin, { client })`. */
export const AuthPlugin = {
    install(app, options) {
        const snapshot = ref(options.client.getSnapshot());
        const unsubscribe = options.client.subscribe((s) => {
            // Vue's ref assignment is reactive; downstream watchers /
            // computed refs / templates re-evaluate.
            snapshot.value = s;
        });
        const bundle = {
            client: options.client,
            snapshot,
            unsubscribe,
        };
        app.provide(AUTH_INJECTION_KEY, bundle);
        if (options.destroyOnUnmount) {
            const originalUnmount = app.unmount.bind(app);
            app.unmount = () => {
                bundle.unsubscribe();
                options.client.destroy();
                originalUnmount();
            };
        }
    },
};
//# sourceMappingURL=plugin.js.map