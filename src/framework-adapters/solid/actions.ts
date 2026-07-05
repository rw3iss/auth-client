/**
 * Solid action helpers — same lifecycle as the React/Preact hooks but
 * built on createSignal.
 *
 *   const login = createLogin();
 *   login.run({ email, password });
 *   <Show when={login.loading()}>Signing in…</Show>
 *   <Show when={login.error()}>{login.error()!.message}</Show>
 *
 * Each accessor (data, error, loading, isIdle) is reactive; reads
 * inside a Solid effect / JSX track automatically.
 */

import { type Accessor, createSignal } from 'solid-js';
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
import { useAuthClient } from './context.js';

export interface SolidAction<TArgs extends unknown[], TResult> {
    /** Invoke the action. */
    run: (...args: TArgs) => Promise<TResult>;
    /** Clear data + error, flip back to idle. */
    reset: () => void;
    data: Accessor<TResult | null>;
    error: Accessor<Error | null>;
    loading: Accessor<boolean>;
    isIdle: Accessor<boolean>;
}

function createAction<Name extends ActionName>(
    name: Name,
    explicitClient: AuthClient | undefined,
): SolidAction<
    Parameters<ReturnType<(typeof ACTION_BINDINGS)[Name]>>,
    Awaited<ReturnType<ReturnType<(typeof ACTION_BINDINGS)[Name]>>>
> {
    type Op = ReturnType<(typeof ACTION_BINDINGS)[Name]>;
    type Result = Awaited<ReturnType<Op>>;
    type Args = Parameters<Op>;

    const client = explicitClient ?? useAuthClient();
    const [state, setState] = createSignal<ActionState<Result>>(
        initialActionState as ActionState<Result>,
    );

    const run = (...args: Args): Promise<Result> => {
        const bind = ACTION_BINDINGS[name] as (c: AuthClient) => (...a: Args) => Promise<Result>;
        const op = bind(client);
        return runAction(op, setState, args);
    };

    const reset = (): void => {
        setState(initialActionState as ActionState<Result>);
    };

    return {
        run,
        reset,
        data: () => state().data,
        error: () => state().error,
        loading: () => state().loading,
        isIdle: () => state().isIdle,
    };
}

/* -----------------------------------------------------------------
 * Named factories — Solid convention uses `create*` for primitive
 * factories (createSignal, createEffect, createMemo). We match.
 * ----------------------------------------------------------------- */

export const createLogin = (client?: AuthClient) => createAction('login', client);
export const createRegister = (client?: AuthClient) => createAction('register', client);
export const createLogout = (client?: AuthClient) => createAction('logout', client);
export const createLogoutAll = (client?: AuthClient) => createAction('logoutAll', client);
export const createStartSso = (client?: AuthClient) => createAction('startSso', client);
export const createCompleteSso = (client?: AuthClient) => createAction('completeSso', client);
export const createRefreshTokens = (client?: AuthClient) => createAction('refresh', client);
export const createWhoami = (client?: AuthClient) => createAction('whoami', client);
export const createSetupTwoFactor = (client?: AuthClient) => createAction('setupTwoFactor', client);
export const createEnableTwoFactor = (client?: AuthClient) => createAction('enableTwoFactor', client);
export const createDisableTwoFactor = (client?: AuthClient) => createAction('disableTwoFactor', client);
export const createImpersonate = (client?: AuthClient) => createAction('impersonate', client);
export const createHardDeleteUser = (client?: AuthClient) => createAction('hardDeleteUser', client);
