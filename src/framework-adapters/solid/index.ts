/**
 * SolidJS adapter — public API.
 *
 * Import as: `import { AuthProvider, useAuth } from '@rw3iss/auth-client/solid'`.
 *
 * Convention: state hooks return Accessors (per Solid idiom). Action
 * factories use the `create*` prefix (matching createSignal, createEffect).
 */

export { AuthProvider, useAuthClient } from './context.js';
export type { AuthProviderProps } from './context.js';

export {
    useAuth,
    useUser,
    useAuthStatus,
    useAuthReady,
    useIsAuthenticated,
} from './hooks.js';
export type { UseAuthResult } from './hooks.js';

export {
    createLogin,
    createRegister,
    createLogout,
    createLogoutAll,
    createStartSso,
    createCompleteSso,
    createRefreshTokens,
    createWhoami,
    createSetupTwoFactor,
    createEnableTwoFactor,
    createDisableTwoFactor,
    createImpersonate,
    createHardDeleteUser,
} from './actions.js';

export type { SolidAction } from './actions.js';
export type { ActionState } from '../shared/action-state.js';
