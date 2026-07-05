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
import { createSignal } from 'solid-js';
import { ACTION_BINDINGS, } from '../shared/action-bindings.js';
import { initialActionState, runAction, } from '../shared/action-state.js';
import { useAuthClient } from './context.js';
function createAction(name, explicitClient) {
    const client = explicitClient ?? useAuthClient();
    const [state, setState] = createSignal(initialActionState);
    const run = (...args) => {
        const bind = ACTION_BINDINGS[name];
        const op = bind(client);
        return runAction(op, setState, args);
    };
    const reset = () => {
        setState(initialActionState);
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
export const createLogin = (client) => createAction('login', client);
export const createRegister = (client) => createAction('register', client);
export const createLogout = (client) => createAction('logout', client);
export const createLogoutAll = (client) => createAction('logoutAll', client);
export const createStartSso = (client) => createAction('startSso', client);
export const createCompleteSso = (client) => createAction('completeSso', client);
export const createRefreshTokens = (client) => createAction('refresh', client);
export const createWhoami = (client) => createAction('whoami', client);
export const createSetupTwoFactor = (client) => createAction('setupTwoFactor', client);
export const createEnableTwoFactor = (client) => createAction('enableTwoFactor', client);
export const createDisableTwoFactor = (client) => createAction('disableTwoFactor', client);
export const createImpersonate = (client) => createAction('impersonate', client);
export const createHardDeleteUser = (client) => createAction('hardDeleteUser', client);
//# sourceMappingURL=actions.js.map