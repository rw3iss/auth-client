/**
 * Vue 3 plugin + provide/inject DI.
 *
 *   import { createApp } from 'vue';
 *   import { createAuthClient } from '@vendidit/auth-client';
 *   import { AuthPlugin } from '@vendidit/auth-client/vue';
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

import { type App, type InjectionKey, type Ref, ref } from 'vue';
import type { AuthClient } from '../../core/auth-client.js';
import type { AuthSnapshot } from '../../core/types.js';

export interface AuthBundle {
    client: AuthClient;
    snapshot: Ref<AuthSnapshot>;
    unsubscribe: () => void;
}

export const AUTH_INJECTION_KEY: InjectionKey<AuthBundle> = Symbol.for(
    '@vendidit/auth-client:vue',
);

export interface AuthPluginOptions {
    /** The AuthClient instance. Constructed at app boot. */
    client: AuthClient;
    /** Tear down the client when the app unmounts. Default false. */
    destroyOnUnmount?: boolean;
}

/** Vue plugin object. Registered via `app.use(AuthPlugin, { client })`. */
export const AuthPlugin = {
    install(app: App, options: AuthPluginOptions): void {
        const snapshot = ref<AuthSnapshot>(options.client.getSnapshot());
        const unsubscribe = options.client.subscribe((s) => {
            // Vue's ref assignment is reactive; downstream watchers /
            // computed refs / templates re-evaluate.
            snapshot.value = s;
        });

        const bundle: AuthBundle = {
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
