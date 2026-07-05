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
import { ref } from 'vue';
import { ACTION_BINDINGS, } from '../shared/action-bindings.js';
import { initialActionState, runAction, } from '../shared/action-state.js';
import { useAuthClient } from './composables.js';
function useAction(name, explicitClient) {
    const client = explicitClient ?? useAuthClient();
    // Individual refs per field — Vue templates can bind directly
    // (action.loading.value) without unwrapping a composite object.
    const data = ref(null);
    const error = ref(null);
    const loading = ref(false);
    const isIdle = ref(true);
    const setState = (next) => {
        data.value = next.data;
        error.value = next.error;
        loading.value = next.loading;
        isIdle.value = next.isIdle;
    };
    const run = (...args) => {
        const bind = ACTION_BINDINGS[name];
        const op = bind(client);
        return runAction(op, setState, args);
    };
    const reset = () => {
        setState(initialActionState);
    };
    return { run, reset, data, error, loading, isIdle };
}
export const useLogin = (client) => useAction('login', client);
export const useRegister = (client) => useAction('register', client);
export const useLogout = (client) => useAction('logout', client);
export const useLogoutAll = (client) => useAction('logoutAll', client);
export const useStartSso = (client) => useAction('startSso', client);
export const useCompleteSso = (client) => useAction('completeSso', client);
export const useRefreshTokens = (client) => useAction('refresh', client);
export const useWhoami = (client) => useAction('whoami', client);
export const useSetupTwoFactor = (client) => useAction('setupTwoFactor', client);
export const useEnableTwoFactor = (client) => useAction('enableTwoFactor', client);
export const useDisableTwoFactor = (client) => useAction('disableTwoFactor', client);
export const useImpersonate = (client) => useAction('impersonate', client);
export const useHardDeleteUser = (client) => useAction('hardDeleteUser', client);
//# sourceMappingURL=actions.js.map