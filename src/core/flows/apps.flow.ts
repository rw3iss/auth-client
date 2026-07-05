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

import { ensureOk, type FlowDeps } from './flow-deps.js';

/* Wire DTOs live in @vendidit/auth-shared (dto/app.ts) — the single
 * TS contract every consumer shares. Re-exported here so existing
 * `import { AppRecord } from '@vendidit/auth-client'` call sites keep
 * working. */
import type {
    AppRecord,
    AppWebhook,
    CreateAppRequest,
    UpdateAppRequest,
    RegistrationPolicy,
} from '@vendidit/auth-shared/dto';
import { APP_WEBHOOK_EVENTS } from '@vendidit/auth-shared/dto';

export type { AppRecord, AppWebhook, CreateAppRequest, UpdateAppRequest, RegistrationPolicy };
export { APP_WEBHOOK_EVENTS };


export class AppsFlow {
    constructor(private readonly deps: FlowDeps) {}

    /**
     * GET /admin/apps — every non-deleted app in the system.
     * Returns an array (the server wraps it as `{ apps: [...] }`;
     * we unwrap here for the canonical SDK shape).
     */
    async list(): Promise<AppRecord[]> {
        const resp = await this.deps.ports.transport.request<{ apps: AppRecord[] }>({
            method: 'GET',
            url: `${this.deps.apiBaseUrl}/admin/apps`,
        });
        await ensureOk(resp);
        return resp.body?.apps ?? [];
    }

    /**
     * GET /admin/users/{userId}/apps — admin view of a user's active
     * app memberships (same shape as /me/apps). Pair with
     * grantUserApp / revokeUserApp for management.
     */
    async listForUser(userId: string): Promise<AppRecord[]> {
        const resp = await this.deps.ports.transport.request<{ apps: AppRecord[] }>({
            method: 'GET',
            url: `${this.deps.apiBaseUrl}/admin/users/${encodeURIComponent(userId)}/apps`,
        });
        await ensureOk(resp);
        return resp.body?.apps ?? [];
    }

    /**
     * POST /admin/users/{userId}/apps/{appId} — grant app access
     * (user_apps row). Idempotent — re-grants reactivate a revoked row.
     */
    async grantUser(userId: string, appId: string): Promise<void> {
        const resp = await this.deps.ports.transport.request({
            method: 'POST',
            url: `${this.deps.apiBaseUrl}/admin/users/${encodeURIComponent(userId)}/apps/${encodeURIComponent(appId)}`,
        });
        await ensureOk(resp);
    }

    /**
     * DELETE /admin/users/{userId}/apps/{appId} — revoke app access.
     * Identity (pools, roles, other apps) is untouched.
     */
    async revokeUser(userId: string, appId: string): Promise<void> {
        const resp = await this.deps.ports.transport.request({
            method: 'DELETE',
            url: `${this.deps.apiBaseUrl}/admin/users/${encodeURIComponent(userId)}/apps/${encodeURIComponent(appId)}`,
        });
        await ensureOk(resp);
    }

    /**
     * GET /apps/{code}/registration-policy — the PUBLIC (anonymous)
     * registration policy: UX hints a login/register form reads BEFORE
     * submit (pre-filter SSO buttons, show domain hints). The server
     * re-enforces on the actual register call — client signal is UX
     * only, never security. Throws if the app code is unknown.
     */
    async getRegistrationPolicy(appCode: string): Promise<RegistrationPolicy> {
        const resp = await this.deps.ports.transport.request<RegistrationPolicy>({
            method: 'GET',
            url: `${this.deps.apiBaseUrl}/apps/${encodeURIComponent(appCode)}/registration-policy`,
        });
        await ensureOk(resp);
        return resp.body;
    }

    /** GET /admin/apps/{appId} — single app row. */
    async get(appId: string): Promise<AppRecord> {
        const resp = await this.deps.ports.transport.request<AppRecord>({
            method: 'GET',
            url: `${this.deps.apiBaseUrl}/admin/apps/${encodeURIComponent(appId)}`,
        });
        await ensureOk(resp);
        return resp.body;
    }

    /** POST /admin/apps — register a new consuming app. system_admin only. */
    async create(body: CreateAppRequest): Promise<AppRecord> {
        const resp = await this.deps.ports.transport.request<AppRecord>({
            method: 'POST',
            url: `${this.deps.apiBaseUrl}/admin/apps`,
            body,
        });
        await ensureOk(resp);
        return resp.body;
    }

    /**
     * PATCH /admin/apps/{appId} — partial update. Only fields in the
     * `body` get applied; everything else is preserved.
     *
     * To disable an app, pass `{ status: 'disabled' }`. Disabling
     * doesn't currently revoke outstanding access tokens for that
     * app — they expire naturally at their `exp`. Refresh requests
     * against a disabled app are rejected by the auth-server.
     */
    async update(appId: string, body: UpdateAppRequest): Promise<AppRecord> {
        const resp = await this.deps.ports.transport.request<AppRecord>({
            method: 'PATCH',
            url: `${this.deps.apiBaseUrl}/admin/apps/${encodeURIComponent(appId)}`,
            body,
        });
        await ensureOk(resp);
        return resp.body;
    }

    /**
     * DELETE /admin/apps/{appId} — soft-delete. The row stays in the
     * DB for audit; `user_apps` memberships are NOT auto-revoked.
     * To fully revoke access for a user, call
     * `DELETE /admin/users/{userId}/apps/{appId}` (RevokeUserApp).
     */
    async delete(appId: string): Promise<void> {
        const resp = await this.deps.ports.transport.request({
            method: 'DELETE',
            url: `${this.deps.apiBaseUrl}/admin/apps/${encodeURIComponent(appId)}`,
        });
        await ensureOk(resp);
    }
}
