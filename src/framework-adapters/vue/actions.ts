/**
 * Vue 3 action composables. Same lifecycle as the React hooks but
 * exposed as reactive refs.
 *
 *   <script setup>
 *   import { useLogin } from '@vendidit/auth-client/vue';
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

import { type Ref, ref } from 'vue';
import type { AuthClient } from '../../core/auth-client.js';
import {
    ACTION_BINDINGS,
    type ActionName,
} from '../shared/action-bindings.js';
import {
    type ActionState,
    initialActionState,
    runAction,
} from '../shared/action-state.js';
import { useAuthClient } from './composables.js';

export interface VueAction<TArgs extends unknown[], TResult> {
    run: (...args: TArgs) => Promise<TResult>;
    reset: () => void;
    data: Ref<TResult | null>;
    error: Ref<Error | null>;
    loading: Ref<boolean>;
    isIdle: Ref<boolean>;
}

function useAction<Name extends ActionName>(
    name: Name,
    explicitClient: AuthClient | undefined,
): VueAction<
    Parameters<ReturnType<(typeof ACTION_BINDINGS)[Name]>>,
    Awaited<ReturnType<ReturnType<(typeof ACTION_BINDINGS)[Name]>>>
> {
    type Op = ReturnType<(typeof ACTION_BINDINGS)[Name]>;
    type Result = Awaited<ReturnType<Op>>;
    type Args = Parameters<Op>;

    const client = explicitClient ?? useAuthClient();

    // Individual refs per field — Vue templates can bind directly
    // (action.loading.value) without unwrapping a composite object.
    const data = ref<Result | null>(null) as Ref<Result | null>;
    const error = ref<Error | null>(null);
    const loading = ref<boolean>(false);
    const isIdle = ref<boolean>(true);

    const setState = (next: ActionState<Result>): void => {
        data.value = next.data;
        error.value = next.error;
        loading.value = next.loading;
        isIdle.value = next.isIdle;
    };

    const run = (...args: Args): Promise<Result> => {
        const bind = ACTION_BINDINGS[name] as (c: AuthClient) => (...a: Args) => Promise<Result>;
        const op = bind(client);
        return runAction(op, setState, args);
    };

    const reset = (): void => {
        setState(initialActionState as ActionState<Result>);
    };

    return { run, reset, data, error, loading, isIdle };
}

export const useLogin = (client?: AuthClient) => useAction('login', client);
export const useRegister = (client?: AuthClient) => useAction('register', client);
export const useLogout = (client?: AuthClient) => useAction('logout', client);
export const useLogoutAll = (client?: AuthClient) => useAction('logoutAll', client);
export const useStartSso = (client?: AuthClient) => useAction('startSso', client);
export const useCompleteSso = (client?: AuthClient) => useAction('completeSso', client);
export const useRefreshTokens = (client?: AuthClient) => useAction('refresh', client);
export const useWhoami = (client?: AuthClient) => useAction('whoami', client);
export const useSetupTwoFactor = (client?: AuthClient) => useAction('setupTwoFactor', client);
export const useEnableTwoFactor = (client?: AuthClient) => useAction('enableTwoFactor', client);
export const useDisableTwoFactor = (client?: AuthClient) => useAction('disableTwoFactor', client);
export const useImpersonate = (client?: AuthClient) => useAction('impersonate', client);
export const useHardDeleteUser = (client?: AuthClient) => useAction('hardDeleteUser', client);
