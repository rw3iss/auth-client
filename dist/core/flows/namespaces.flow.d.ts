/**
 * User pools (namespaces) admin flow — system_admin only on every
 * route. Pool model (auth-server docs/USER_POOLS.md): each user has
 * ONE default (home) pool (`users.namespace`) + N tag pools
 * (`user_namespaces`); email is unique per (pool, email); pools are
 * virtual (no pools table — a pool exists because a user or app
 * config references its name).
 *
 * Caching: `list()` memoizes the pool catalog for CACHE_TTL_MS so
 * type-ahead pool pickers (the demo's PoolSearchInput) can call it on
 * every focus without hammering `/admin/namespaces`. Every mutation
 * on this flow invalidates the cache; pass `{ forceRefresh: true }`
 * to bypass it explicitly.
 */
import { type FlowDeps } from './flow-deps.js';
import type { NamespaceInfo, ListNamespacesResponse, UserNamespacesResponse } from '@vendidit/auth-shared/dto';
export type { NamespaceInfo, ListNamespacesResponse, UserNamespacesResponse };
export declare class NamespacesFlow {
    private readonly deps;
    private cache;
    constructor(deps: FlowDeps);
    /**
     * GET /admin/namespaces — every known pool with user counts
     * (home / tag / distinct total) + the app codes referencing it.
     * Cached for 60s; mutations on this flow invalidate.
     */
    list(opts?: {
        forceRefresh?: boolean;
    }): Promise<NamespaceInfo[]>;
    /** Drop the cached pool catalog (next list() refetches). */
    invalidate(): void;
    /**
     * GET /admin/users/{userId}/namespaces — the user's home (default)
     * pool + tag pools.
     */
    getForUser(userId: string): Promise<UserNamespacesResponse>;
    /**
     * PUT /admin/users/{userId}/namespace — move the user's default
     * (home) pool. 409 when the email already exists in the target
     * pool. A tag equal to the new home pool is cleaned up server-side.
     */
    setUserHome(userId: string, namespace: string): Promise<void>;
    /**
     * POST /admin/users/{userId}/namespaces — tag the user into an
     * additional pool. Idempotent; tagging the home pool is rejected.
     */
    addUserNamespace(userId: string, namespace: string): Promise<void>;
    /**
     * DELETE /admin/users/{userId}/namespaces/{namespace} — remove a
     * pool tag. The home pool is refused — use setUserHome instead.
     */
    removeUserNamespace(userId: string, namespace: string): Promise<void>;
}
//# sourceMappingURL=namespaces.flow.d.ts.map