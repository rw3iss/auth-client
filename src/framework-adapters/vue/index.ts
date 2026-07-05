/**
 * Vue 3 adapter — public API.
 *
 * Import as: `import { AuthPlugin, useAuth } from '@rw3iss/auth-client/vue'`.
 *
 * Install via app.use(AuthPlugin, { client }) once at boot; consume via
 * useAuth() composables anywhere in the component tree.
 */

export { AuthPlugin, AUTH_INJECTION_KEY } from './plugin.js';
export type { AuthPluginOptions, AuthBundle } from './plugin.js';

export {
    useAuth,
    useAuthClient,
    useUser,
    useAuthStatus,
    useAuthReady,
    useIsAuthenticated,
} from './composables.js';
export type { UseAuthResult } from './composables.js';

export {
    useLogin,
    useRegister,
    useLogout,
    useLogoutAll,
    useStartSso,
    useCompleteSso,
    useRefreshTokens,
    useWhoami,
    useSetupTwoFactor,
    useEnableTwoFactor,
    useDisableTwoFactor,
    useImpersonate,
    useHardDeleteUser,
} from './actions.js';
export type { VueAction } from './actions.js';
export type { ActionState } from '../shared/action-state.js';
