export class AppsModule {
    ctx;
    constructor(ctx) {
        this.ctx = ctx;
    }
    /** GET /admin/apps — list every registered app. adminChain. */
    async list() {
        this.ctx.guard('listApps');
        return this.ctx.flows.apps.list();
    }
    /** GET /admin/apps/{appId} — one app row. adminChain. */
    async get(appId) {
        this.ctx.guard('getApp');
        return this.ctx.flows.apps.get(appId);
    }
    /** POST /admin/apps — register a new app. systemAdminChain. */
    async create(body) {
        this.ctx.guard('createApp');
        return this.ctx.flows.apps.create(body);
    }
    /** PATCH /admin/apps/{appId} — partial update. systemAdminChain. */
    async update(appId, body) {
        this.ctx.guard('updateApp');
        return this.ctx.flows.apps.update(appId, body);
    }
    /** DELETE /admin/apps/{appId} — soft-delete. systemAdminChain. */
    async delete(appId) {
        this.ctx.guard('deleteApp');
        return this.ctx.flows.apps.delete(appId);
    }
    /**
     * Fetch the public registration policy for an app. Anonymous —
     * no token required. Useful for rendering the login / register UI
     * BEFORE the user submits: pre-filter SSO buttons against
     * `allowed_auth_methods`, show a domain hint from
     * `allowed_email_domains`. Server still enforces on the actual
     * register/login call. Migration 013.
     *
     * If `appCode` is omitted, defaults to the AuthClient's configured
     * `appCode` (set on construction). Throws if neither is set.
     */
    async getRegistrationPolicy(appCode) {
        return this.ctx.core.getRegistrationPolicy(appCode);
    }
    /** GET /admin/users/{id}/apps — a user's active app memberships. */
    async listForUser(userId) {
        this.ctx.guard('adminListUserApps');
        return this.ctx.flows.apps.listForUser(userId);
    }
    /** POST /admin/users/{id}/apps/{appId} — grant app access. */
    async grantUser(userId, appId) {
        this.ctx.guard('adminGrantUserApp');
        return this.ctx.flows.apps.grantUser(userId, appId);
    }
    /** DELETE /admin/users/{id}/apps/{appId} — revoke app access. */
    async revokeUser(userId, appId) {
        this.ctx.guard('adminRevokeUserApp');
        return this.ctx.flows.apps.revokeUser(userId, appId);
    }
}
//# sourceMappingURL=apps.module.js.map