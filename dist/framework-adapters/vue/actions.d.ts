/**
 * Vue 3 action composables. Same lifecycle as the React hooks but
 * exposed as reactive refs.
 *
 *   <script setup>
 *   import { useLogin } from '@rw3iss/auth-client/vue';
 *   const login = useLogin();
 *   async function submit() { await login.run({ email: 'a@b.com', password: '...' }); }
 *   </script>
 *
 *   <template>
 *     <button :disabled="login.loading.value" @click="submit">
 *       {{ login.loading.value ? 'Signing in…' : 'Sign in' }}
 *     </button>
 *     <p v-if="login.error.value">{{ login.error.value.message }}</p>
 *   </template>
 */
import { type Ref } from 'vue';
import type { AuthClient } from '../../core/auth-client.js';
export interface VueAction<TArgs extends unknown[], TResult> {
    run: (...args: TArgs) => Promise<TResult>;
    reset: () => void;
    data: Ref<TResult | null>;
    error: Ref<Error | null>;
    loading: Ref<boolean>;
    isIdle: Ref<boolean>;
}
export declare const useLogin: (client?: AuthClient) => VueAction<[params: import("../../index.js").LoginParams], import("@rw3iss/auth-shared").AuthResponse>;
export declare const useRegister: (client?: AuthClient) => VueAction<[params: import("../../index.js").RegisterParams], import("@rw3iss/auth-shared").AuthResponse>;
export declare const useLogout: (client?: AuthClient) => VueAction<[], void>;
export declare const useLogoutAll: (client?: AuthClient) => VueAction<[], void>;
export declare const useStartSso: (client?: AuthClient) => VueAction<[params: import("../../index.js").SsoStartParams], import("../../index.js").SsoStartResult>;
export declare const useCompleteSso: (client?: AuthClient) => VueAction<[params: {
    code: string;
    state: string;
    provider?: string;
}], import("@rw3iss/auth-shared").AuthResponse>;
export declare const useRefreshTokens: (client?: AuthClient) => VueAction<[], import("@rw3iss/auth-shared").TokenPair>;
export declare const useWhoami: (client?: AuthClient) => VueAction<[], import("@rw3iss/auth-shared").User>;
export declare const useSetupTwoFactor: (client?: AuthClient) => VueAction<[], {
    secret: string;
    provisioningUri: string;
}>;
export declare const useEnableTwoFactor: (client?: AuthClient) => VueAction<[code: string], void>;
export declare const useDisableTwoFactor: (client?: AuthClient) => VueAction<[params: {
    password: string;
    code: string;
}], void>;
export declare const useImpersonate: (client?: AuthClient) => VueAction<[params: import("../../index.js").ImpersonateParams], import("@rw3iss/auth-shared").AuthResponse>;
export declare const useHardDeleteUser: (client?: AuthClient) => VueAction<[params: {
    userId: string;
    reason: string;
}], void>;
//# sourceMappingURL=actions.d.ts.map