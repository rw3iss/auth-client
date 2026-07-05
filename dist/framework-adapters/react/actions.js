/**
 * Action hooks — useLogin, useRegister, useLogout, etc. Each returns
 * `{ run, data, error, loading, isIdle, reset }` so a component can:
 *
 *   const login = useLogin();
 *   <form onSubmit={() => login.run({email, password})}>
 *     {login.loading && <Spinner />}
 *     {login.error && <Banner error={login.error} />}
 *   </form>
 *
 * One generic factory drives every action; the named exports are
 * one-liners on top so consumers get IntelliSense for the right
 * argument types per action.
 */
import { useCallback, useState } from 'react';
import { ACTION_BINDINGS, } from '../shared/action-bindings.js';
import { initialActionState, runAction, } from '../shared/action-state.js';
import { useAuthClient } from './context.js';
/**
 * Generic factory: wires an ActionName to an Action<TArgs, TResult>
 * hook. Each named hook below is a one-line call into this.
 */
function useAction(name, explicitClient) {
    const ctxClient = useAuthClient();
    const client = explicitClient ?? ctxClient;
    const [state, setState] = useState(initialActionState);
    const run = useCallback((...args) => {
        const bind = ACTION_BINDINGS[name];
        const op = bind(client);
        return runAction(op, setState, args);
    }, [client, name]);
    const reset = useCallback(() => {
        setState(initialActionState);
    }, []);
    return { ...state, run, reset };
}
/* -----------------------------------------------------------------
 * Named hooks — one per action. Thin wrappers over useAction so
 * consumers get the right argument/result types via IntelliSense.
 * ----------------------------------------------------------------- */
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