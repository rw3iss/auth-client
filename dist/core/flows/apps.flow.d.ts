/**
 * Apps admin flow — CRUD over `/admin/apps` for back-office UIs.
 *
 * The auth-server's app registry tracks every consuming application
 * (browser SPA, mobile client, backend service, …). One row per app;
 * a user becomes "authorized for an app" via the user_apps join
 * table, which is created on first login when the app has
 * `auto_grant_on_signup: true` (or explicitly by an admin via
 * `POST /admin/users/{userId}/apps/{appId}`).
 *
 * Gating:
 *   - GET /admin/apps + GET /admin/apps/{appId}     adminChain (system OR super admin)
 *   - POST /admin/apps + PATCH + DELETE              systemAdminChain (system_admin only)
 *
 * The SDK methods don't pre-check the caller's role — the server is
 * the source of truth; the UI tier should use <RoleGate> /
 * <SystemAdminOnly> to hide the affordances.
 */
import { type FlowDeps } from './flow-deps.js';
import type { AppRecord, AppWebhook, CreateAppRequest, UpdateAppRequest, RegistrationPolicy } from '@vendidit/auth-shared/dto';
import { APP_WEBHOOK_EVENTS } from '@vendidit/auth-shared/dto';
export type { AppRecord, AppWebhook, CreateAppRequest, UpdateAppRequest, RegistrationPolicy };
export { APP_WEBHOOK_EVENTS };
export declare class AppsFlow {
    private readonly deps;
    constructor(deps: FlowDeps);
    /**
     * GET /admin/apps — every non-deleted app in the system.
     * Returns an array (the server wraps it as `{ apps: [...] }`;
     * we unwrap here for the canonical SDK shape).
     */
    list(): Promise<AppRecord[]>;
    /**
     * GET /admin/users/{userId}/apps — admin view of a user's active
     * app memberships (same shape as /me/apps). Pair with
     * grantUserApp / revokeUserApp for management.
     */
    listForUser(userId: string): Promise<AppRecord[]>;
    /**
     * POST /admin/users/{userId}/apps/{appId} — grant app access
     * (user_apps row). Idempotent — re-grants reactivate a revoked row.
     */
    grantUser(userId: string, appId: string): Promise<void>;
    /**
     * DELETE /admin/users/{userId}/apps/{appId} — revoke app access.
     * Identity (pools, roles, other apps) is untouched.
     */
    revokeUser(userId: string, appId: string): Promise<void>;
    /**
     * GET /apps/{code}/registration-policy — the PUBLIC (anonymous)
     * registration policy: UX hints a login/register form reads BEFORE
     * submit (pre-filter SSO buttons, show domain hints). The server
     * re-enforces on the actual register call — client signal is UX
     * only, never security. Throws if the app code is unknown.
     */
    getRegistrationPolicy(appCode: string): Promise<RegistrationPolicy>;
    /** GET /admin/apps/{appId} — single app row. */
    get(appId: string): Promise<AppRecord>;
    /** POST /admin/apps — register a new consuming app. system_admin only. */
    create(body: CreateAppRequest): Promise<AppRecord>;
    /**
     * PATCH /admin/apps/{appId} — partial update. Only fields in the
     * `body` get applied; everything else is preserved.
     *
     * To disable an app, pass `{ status: 'disabled' }`. Disabling
     * doesn't currently revoke outstanding access tokens for that
     * app — they expire naturally at their `exp`. Refresh requests
     * against a disabled app are rejected by the auth-server.
     */
    update(appId: string, body: UpdateAppRequest): Promise<AppRecord>;
    /**
     * DELETE /admin/apps/{appId} — soft-delete. The row stays in the
     * DB for audit; `user_apps` memberships are NOT auto-revoked.
     * To fully revoke access for a user, call
     * `DELETE /admin/users/{userId}/apps/{appId}` (RevokeUserApp).
     */
    delete(appId: string): Promise<void>;
}
//# sourceMappingURL=apps.flow.d.ts.map