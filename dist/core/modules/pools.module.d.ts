/**
 * `client.pools` — user pools (namespaces) administration
 * (system_admin only). One default "home" pool per user + N tag
 * pools; email is unique per (pool, email). The catalog is cached
 * 60s inside the namespaces flow for type-ahead pickers.
 */
import type { ModuleContext } from '../module-context.js';
import type { NamespaceInfo, UserNamespacesResponse } from '../flows/namespaces.flow.js';
export declare class PoolsModule {
    private readonly ctx;
    constructor(ctx: ModuleContext);
    /** GET /admin/namespaces — pool catalog w/ user counts (cached 60s). */
    list(opts?: {
        forceRefresh?: boolean;
    }): Promise<NamespaceInfo[]>;
    /** GET /admin/users/{id}/namespaces — home pool + tag pools. */
    getForUser(userId: string): Promise<UserNamespacesResponse>;
    /** PUT /admin/users/{id}/namespace — move the default (home) pool.
     *  409 when the email already exists in the target pool. */
    setUserHome(userId: string, namespace: string): Promise<void>;
    /** POST /admin/users/{id}/namespaces — tag into an extra pool. */
    addUser(userId: string, namespace: string): Promise<void>;
    /** DELETE /admin/users/{id}/namespaces/{ns} — remove a pool tag. */
    removeUser(userId: string, namespace: string): Promise<void>;
}
//# sourceMappingURL=pools.module.d.ts.map