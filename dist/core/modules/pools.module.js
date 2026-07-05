export class PoolsModule {
    ctx;
    constructor(ctx) {
        this.ctx = ctx;
    }
    /** GET /admin/namespaces — pool catalog w/ user counts (cached 60s). */
    async list(opts = {}) {
        this.ctx.guard('listNamespaces');
        return this.ctx.flows.namespaces.list(opts);
    }
    /** GET /admin/users/{id}/namespaces — home pool + tag pools. */
    async getForUser(userId) {
        this.ctx.guard('getUserNamespaces');
        return this.ctx.flows.namespaces.getForUser(userId);
    }
    /** PUT /admin/users/{id}/namespace — move the default (home) pool.
     *  409 when the email already exists in the target pool. */
    async setUserHome(userId, namespace) {
        this.ctx.guard('setUserHomeNamespace');
        return this.ctx.flows.namespaces.setUserHome(userId, namespace);
    }
    /** POST /admin/users/{id}/namespaces — tag into an extra pool. */
    async addUser(userId, namespace) {
        this.ctx.guard('addUserNamespace');
        return this.ctx.flows.namespaces.addUserNamespace(userId, namespace);
    }
    /** DELETE /admin/users/{id}/namespaces/{ns} — remove a pool tag. */
    async removeUser(userId, namespace) {
        this.ctx.guard('removeUserNamespace');
        return this.ctx.flows.namespaces.removeUserNamespace(userId, namespace);
    }
}
//# sourceMappingURL=pools.module.js.map