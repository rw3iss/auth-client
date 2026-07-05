/**
 * `client.pools` — user pools (namespaces) administration
 * (system_admin only). One default "home" pool per user + N tag
 * pools; email is unique per (pool, email). The catalog is cached
 * 60s inside the namespaces flow for type-ahead pickers.
 */
import type { ModuleContext } from '../module-context.js';
import type { NamespaceInfo, UserNamespacesResponse } from '../flows/namespaces.flow.js';

export class PoolsModule {
    constructor(private readonly ctx: ModuleContext) {}

    /** GET /admin/namespaces — pool catalog w/ user counts (cached 60s). */
    async list(opts: { forceRefresh?: boolean } = {}): Promise<NamespaceInfo[]> {
        this.ctx.guard('listNamespaces');
        return this.ctx.flows.namespaces.list(opts);
    }

    /** GET /admin/users/{id}/namespaces — home pool + tag pools. */
    async getForUser(userId: string): Promise<UserNamespacesResponse> {
        this.ctx.guard('getUserNamespaces');
        return this.ctx.flows.namespaces.getForUser(userId);
    }

    /** PUT /admin/users/{id}/namespace — move the default (home) pool.
     *  409 when the email already exists in the target pool. */
    async setUserHome(userId: string, namespace: string): Promise<void> {
        this.ctx.guard('setUserHomeNamespace');
        return this.ctx.flows.namespaces.setUserHome(userId, namespace);
    }

    /** POST /admin/users/{id}/namespaces — tag into an extra pool. */
    async addUser(userId: string, namespace: string): Promise<void> {
        this.ctx.guard('addUserNamespace');
        return this.ctx.flows.namespaces.addUserNamespace(userId, namespace);
    }

    /** DELETE /admin/users/{id}/namespaces/{ns} — remove a pool tag. */
    async removeUser(userId: string, namespace: string): Promise<void> {
        this.ctx.guard('removeUserNamespace');
        return this.ctx.flows.namespaces.removeUserNamespace(userId, namespace);
    }
}
