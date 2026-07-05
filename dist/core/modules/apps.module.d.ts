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
export declare class AppsModule {
    private readonly ctx;
    constructor(ctx: ModuleContext);
    /** GET /admin/apps — list every registered app. adminChain. */
    list(): Promise<AppRecord[]>;
    /** GET /admin/apps/{appId} — one app row. adminChain. */
    get(appId: string): Promise<AppRecord>;
    /** POST /admin/apps — register a new app. systemAdminChain. */
    create(body: CreateAppRequest): Promise<AppRecord>;
    /** PATCH /admin/apps/{appId} — partial update. systemAdminChain. */
    update(appId: string, body: UpdateAppRequest): Promise<AppRecord>;
    /** DELETE /admin/apps/{appId} — soft-delete. systemAdminChain. */
    delete(appId: string): Promise<void>;
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
    getRegistrationPolicy(appCode?: string): Promise<RegistrationPolicy>;
    /** GET /admin/users/{id}/apps — a user's active app memberships. */
    listForUser(userId: string): Promise<AppRecord[]>;
    /** POST /admin/users/{id}/apps/{appId} — grant app access. */
    grantUser(userId: string, appId: string): Promise<void>;
    /** DELETE /admin/users/{id}/apps/{appId} — revoke app access. */
    revokeUser(userId: string, appId: string): Promise<void>;
}
//# sourceMappingURL=apps.module.d.ts.map