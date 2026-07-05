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
import {
    ACTION_BINDINGS,
    type ActionName,
} from '../shared/action-bindings.js';
import {
    type ActionState,
    type Action,
    initialActionState,
    runAction,
} from '../shared/action-state.js';
import { useAuthClient } from './context.js';
import type { AuthClient } from '../../core/auth-client.js';

/**
 * Generic factory: wires an ActionName to an Action<TArgs, TResult>
 * hook. Each named hook below is a one-line call into this.
 */
function useAction<Name extends ActionName>(
    name: Name,
    explicitClient: AuthClient | undefined,
): Action<
    Parameters<ReturnType<(typeof ACTION_BINDINGS)[Name]>>,
    Awaited<ReturnType<ReturnType<(typeof ACTION_BINDINGS)[Name]>>>
> {
    type Op = ReturnType<(typeof ACTION_BINDINGS)[Name]>;
    type Result = Awaited<ReturnType<Op>>;
    type Args = Parameters<Op>;

    const ctxClient = useAuthClient();
    const client = explicitClient ?? ctxClient;
    const [state, setState] = useState<ActionState<Result>>(
        initialActionState as ActionState<Result>,
    );

    const run = useCallback(
        (...args: Args): Promise<Result> => {
            const bind = ACTION_BINDINGS[name] as (c: AuthClient) => (...a: Args) => Promise<Result>;
            const op = bind(client);
            return runAction(op, setState, args);
        },
        [client, name],
    );

    const reset = useCallback(() => {
        setState(initialActionState as ActionState<Result>);
    }, []);

    return { ...state, run, reset };
}

/* -----------------------------------------------------------------
 * Named hooks — one per action. Thin wrappers over useAction so
 * consumers get the right argument/result types via IntelliSense.
 * ----------------------------------------------------------------- */

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
