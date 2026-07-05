/**
 * `client.apps` — the consuming-application registry
 * (`/admin/apps/*`, system_admin) plus per-user app ACCESS grants
 * (`user_apps` rows — separate from identity) and the public
 * registration-policy lookup.
 *
 * Apps issue USER tokens; machine credentials (service tokens) are
 * `client.services`.
 */
import type { ModuleContext } from '../module-context.js';
import type { AppRecord, CreateAppRequest, UpdateAppRequest, RegistrationPolicy } from '../flows/apps.flow.js';

export class AppsModule {
    constructor(private readonly ctx: ModuleContext) {}

    /** GET /admin/apps — list every registered app. adminChain. */
    async list(): Promise<AppRecord[]> {
        this.ctx.guard('listApps');
        return this.ctx.flows.apps.list();
    }

    /** GET /admin/apps/{appId} — one app row. adminChain. */
    async get(appId: string): Promise<AppRecord> {
        this.ctx.guard('getApp');
        return this.ctx.flows.apps.get(appId);
    }

    /** POST /admin/apps — register a new app. systemAdminChain. */
    async create(body: CreateAppRequest): Promise<AppRecord> {
        this.ctx.guard('createApp');
        return this.ctx.flows.apps.create(body);
    }

    /** PATCH /admin/apps/{appId} — partial update. systemAdminChain. */
    async update(appId: string, body: UpdateAppRequest): Promise<AppRecord> {
        this.ctx.guard('updateApp');
        return this.ctx.flows.apps.update(appId, body);
    }

    /** DELETE /admin/apps/{appId} — soft-delete. systemAdminChain. */
    async delete(appId: string): Promise<void> {
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
    async getRegistrationPolicy(appCode?: string): Promise<RegistrationPolicy> {
        return this.ctx.core.getRegistrationPolicy(appCode);
    }

    /** GET /admin/users/{id}/apps — a user's active app memberships. */
    async listForUser(userId: string): Promise<AppRecord[]> {
        this.ctx.guard('adminListUserApps');
        return this.ctx.flows.apps.listForUser(userId);
    }

    /** POST /admin/users/{id}/apps/{appId} — grant app access. */
    async grantUser(userId: string, appId: string): Promise<void> {
        this.ctx.guard('adminGrantUserApp');
        return this.ctx.flows.apps.grantUser(userId, appId);
    }

    /** DELETE /admin/users/{id}/apps/{appId} — revoke app access. */
    async revokeUser(userId: string, appId: string): Promise<void> {
        this.ctx.guard('adminRevokeUserApp');
        return this.ctx.flows.apps.revokeUser(userId, appId);
    }
}
