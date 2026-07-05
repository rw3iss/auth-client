/**
 * Preact state hooks. Uses preact/compat's useSyncExternalStore — same
 * contract as React 18.
 */
import type { AuthClient } from '../../core/auth-client.js';
import type { AuthSnapshot, AuthStatus } from '../../core/types.js';
export declare function useAuth(explicitClient?: AuthClient): AuthSnapshot;
export declare function useUser(explicitClient?: AuthClient): AuthSnapshot['user'];
export declare function useAuthStatus(explicitClient?: AuthClient): AuthStatus;
export declare function useIsAuthenticated(explicitClient?: AuthClient): boolean;
export declare function useAuthReady(explicitClient?: AuthClient): boolean;
/**
 * Convenience hook returning the current organization context derived
 * from the auth snapshot's access-token claims, plus a `switch` fn
 * bound to the same AuthClient.
 *
 * Returns `null` when the caller has no org context (anonymous, or
 * authenticated but logged in without an org). Use a nullish check
 * before reading fields.
 *
 * Equivalent to manually reading `snap.claims?.org_*` + calling
 * `client.switchOrg(id)`, but condenses the common idiom.
 */
export declare function useOrg(explicitClient?: AuthClient): {
    id: string;
    slug: string;
    name: string;
    switch: (organizationId: string) => Promise<void>;
} | null;
/**
 * Loads + caches the public registration policy for an app code on
 * mount. Returns `{ policy, loading, error }`. Default `appCode` is the
 * client's configured one (set on `createAuthClient({ appCode })`).
 *
 * Components like LoginForm / RegisterForm accept this policy shape
 * directly so they can self-configure (filter SSO buttons, validate
 * email domain). For purely-headless use, call
 * `client.getRegistrationPolicy()` directly.
 */
export declare function useAppPolicy(appCode?: string, explicitClient?: AuthClient): {
    policy: import('../../core/flows/apps.flow.js').RegistrationPolicy | null;
    loading: boolean;
    error: Error | null;
};
/**
 * Loads the deployment's enabled SSO providers on mount (public; no
 * auth). Returns `{ providers, loading }` with lower-cased names
 * (`['google','github']`). Empty when none are enabled — render your
 * SSO section only when `providers.length > 0` so disabled providers
 * don't show dead buttons.
 */
export declare function useSsoProviders(explicitClient?: AuthClient): {
    providers: string[];
    loading: boolean;
};
//# sourceMappingURL=hooks.d.ts.map