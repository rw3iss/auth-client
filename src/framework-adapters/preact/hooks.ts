/**
 * Preact state hooks. Uses preact/compat's useSyncExternalStore — same
 * contract as React 18.
 */

import { useSyncExternalStore } from 'preact/compat';
import type { AuthClient } from '../../core/auth-client.js';
import type { AuthSnapshot, AuthStatus } from '../../core/types.js';
import { useAuthClient } from './context.js';

export function useAuth(explicitClient?: AuthClient): AuthSnapshot {
    const ctxClient = useAuthClient();
    const client = explicitClient ?? ctxClient;
    // Preact's useSyncExternalStore signature mirrors React's but omits
    // the optional server-snapshot arg in some versions. Calling with
    // just (subscribe, getSnapshot) matches both 18+ React and Preact.
    return useSyncExternalStore(
        client.subscribe.bind(client),
        client.getSnapshot.bind(client),
    );
}

export function useUser(explicitClient?: AuthClient): AuthSnapshot['user'] {
    return useAuth(explicitClient).user;
}

export function useAuthStatus(explicitClient?: AuthClient): AuthStatus {
    return useAuth(explicitClient).status;
}

export function useIsAuthenticated(explicitClient?: AuthClient): boolean {
    return useAuth(explicitClient).status === 'authenticated';
}

export function useAuthReady(explicitClient?: AuthClient): boolean {
    return useAuth(explicitClient).ready;
}

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
export function useOrg(explicitClient?: AuthClient): {
    id: string;
    slug: string;
    name: string;
    switch: (organizationId: string) => Promise<void>;
} | null {
    const ctxClient = useAuthClient();
    const client = explicitClient ?? ctxClient;
    const snap = useAuth(client);
    const claims = snap.claims;
    if (!claims?.org_id) return null;
    return {
        id: claims.org_id,
        slug: claims.org_slug ?? '',
        name: claims.org_name ?? '',
        switch: async (organizationId: string) => {
            await client.switchOrg(organizationId);
        },
    };
}

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
export function useAppPolicy(
    appCode?: string,
    explicitClient?: AuthClient,
): {
    policy: import('../../core/flows/apps.flow.js').RegistrationPolicy | null;
    loading: boolean;
    error: Error | null;
} {
    const ctxClient = useAuthClient();
    const client = explicitClient ?? ctxClient;
    const [policy, setPolicy] = useStateLocal<import('../../core/flows/apps.flow.js').RegistrationPolicy | null>(null);
    const [loading, setLoading] = useStateLocal(true);
    const [error, setError] = useStateLocal<Error | null>(null);
    useEffectLocal(() => {
        let cancelled = false;
        setLoading(true);
        client.getRegistrationPolicy(appCode)
            .then((p) => { if (!cancelled) { setPolicy(p); setError(null); } })
            .catch((e: unknown) => { if (!cancelled) setError(e instanceof Error ? e : new Error(String(e))); })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [appCode]);
    return { policy, loading, error };
}

/**
 * Loads the deployment's enabled SSO providers on mount (public; no
 * auth). Returns `{ providers, loading }` with lower-cased names
 * (`['google','github']`). Empty when none are enabled — render your
 * SSO section only when `providers.length > 0` so disabled providers
 * don't show dead buttons.
 */
export function useSsoProviders(
    explicitClient?: AuthClient,
): { providers: string[]; loading: boolean } {
    const ctxClient = useAuthClient();
    const client = explicitClient ?? ctxClient;
    const [providers, setProviders] = useStateLocal<string[]>([]);
    const [loading, setLoading] = useStateLocal(true);
    useEffectLocal(() => {
        let cancelled = false;
        setLoading(true);
        client
            .getSsoProviders()
            .then((p) => { if (!cancelled) setProviders(p); })
            .catch(() => { if (!cancelled) setProviders([]); })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return { providers, loading };
}

// Imports kept local-scoped at the bottom so the hook below can share
// the same useSyncExternalStore import without re-ordering the top.
import { useState as useStateLocal, useEffect as useEffectLocal } from 'preact/hooks';
