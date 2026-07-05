/**
 * React adapter — public API.
 *
 * Import as: `import { AuthProvider, useAuth } from '@vendidit/auth-client/react'`.
 *
 * Shape:
 *
 *   <AuthProvider client={authClient}>
 *     <App />
 *   </AuthProvider>
 *
 *   function Login() {
 *     const login = useLogin();
 *     const { user, ready } = useAuth();
 *     if (!ready) return <Splash />;
 *     if (user) return <Dashboard />;
 *     return (
 *       <form onSubmit={(e) => { e.preventDefault(); login.run({...}); }}>
 *         {login.error && <Banner>{login.error.message}</Banner>}
 *         {login.loading ? 'Signing in…' : 'Sign in'}
 *       </form>
 *     );
 *   }
 */
export { AuthProvider, useAuthClient } from './context.js';
export type { AuthProviderProps } from './context.js';
export { useAuth, useUser, useAuthStatus, useIsAuthenticated, useAuthReady, } from './hooks.js';
export { useLogin, useRegister, useLogout, useLogoutAll, useStartSso, useCompleteSso, useRefreshTokens, useWhoami, useSetupTwoFactor, useEnableTwoFactor, useDisableTwoFactor, useImpersonate, useHardDeleteUser, } from './actions.js';
export type { Action, ActionState } from '../shared/action-state.js';
//# sourceMappingURL=index.d.ts.map