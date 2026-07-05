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

import { ensureOk, type FlowDeps } from './flow-deps.js';
import type {
    NamespaceInfo,
    ListNamespacesResponse,
    UserNamespacesResponse,
} from '@rw3iss/auth-shared/dto';

export type { NamespaceInfo, ListNamespacesResponse, UserNamespacesResponse };

/** How long the pool catalog stays fresh between refetches. */
const CACHE_TTL_MS = 60_000;

export class NamespacesFlow {
    private cache: { at: number; namespaces: NamespaceInfo[] } | null = null;

    constructor(private readonly deps: FlowDeps) {}

    /**
     * GET /admin/namespaces — every known pool with user counts
     * (home / tag / distinct total) + the app codes referencing it.
     * Cached for 60s; mutations on this flow invalidate.
     */
    async list(opts: { forceRefresh?: boolean } = {}): Promise<NamespaceInfo[]> {
        if (!opts.forceRefresh && this.cache && Date.now() - this.cache.at < CACHE_TTL_MS) {
            return this.cache.namespaces;
        }
        const resp = await this.deps.ports.transport.request<ListNamespacesResponse>({
            method: 'GET',
            url: `${this.deps.apiBaseUrl}/admin/namespaces`,
        });
        await ensureOk(resp);
        const namespaces = resp.body?.namespaces ?? [];
        this.cache = { at: Date.now(), namespaces };
        return namespaces;
    }

    /** Drop the cached pool catalog (next list() refetches). */
    invalidate(): void {
        this.cache = null;
    }

    /**
     * GET /admin/users/{userId}/namespaces — the user's home (default)
     * pool + tag pools.
     */
    async getForUser(userId: string): Promise<UserNamespacesResponse> {
        const resp = await this.deps.ports.transport.request<UserNamespacesResponse>({
            method: 'GET',
            url: `${this.deps.apiBaseUrl}/admin/users/${encodeURIComponent(userId)}/namespaces`,
        });
        await ensureOk(resp);
        return resp.body as UserNamespacesResponse;
    }

    /**
     * PUT /admin/users/{userId}/namespace — move the user's default
     * (home) pool. 409 when the email already exists in the target
     * pool. A tag equal to the new home pool is cleaned up server-side.
     */
    async setUserHome(userId: string, namespace: string): Promise<void> {
        const resp = await this.deps.ports.transport.request({
            method: 'PUT',
            url: `${this.deps.apiBaseUrl}/admin/users/${encodeURIComponent(userId)}/namespace`,
            body: { namespace },
        });
        await ensureOk(resp);
        this.invalidate();
    }

    /**
     * POST /admin/users/{userId}/namespaces — tag the user into an
     * additional pool. Idempotent; tagging the home pool is rejected.
     */
    async addUserNamespace(userId: string, namespace: string): Promise<void> {
        const resp = await this.deps.ports.transport.request({
            method: 'POST',
            url: `${this.deps.apiBaseUrl}/admin/users/${encodeURIComponent(userId)}/namespaces`,
            body: { namespace },
        });
        await ensureOk(resp);
        this.invalidate();
    }

    /**
     * DELETE /admin/users/{userId}/namespaces/{namespace} — remove a
     * pool tag. The home pool is refused — use setUserHome instead.
     */
    async removeUserNamespace(userId: string, namespace: string): Promise<void> {
        const resp = await this.deps.ports.transport.request({
            method: 'DELETE',
            url: `${this.deps.apiBaseUrl}/admin/users/${encodeURIComponent(userId)}/namespaces/${encodeURIComponent(namespace)}`,
        });
        await ensureOk(resp);
        this.invalidate();
    }
}
