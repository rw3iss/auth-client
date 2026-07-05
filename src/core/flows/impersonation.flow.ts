/**
 * User-impersonation flow (AUDIT C7 — wire-compatible with
 * /admin/users/{userId}/impersonate on the auth-server).
 *
 * Server-side authorization:
 *   - system_admin / super_admin → any target.
 *   - org_admin → only targets in the actor's org-scoped session.
 *   - Self-impersonation refused.
 *   - Chained impersonation refused (a token already carrying imp_uid
 *     cannot launch a new impersonation).
 *
 * On success the response is the standard LoginResponse shape — same as
 * a fresh login, but the access token carries imp_uid + imp_email
 * claims. The AuthClient persists these tokens and the
 * isImpersonating() / getDecodedClaims() helpers light up.
 */

import type { AuthResponse } from '../types.js';
import { ensureOk, type FlowDeps } from './flow-deps.js';

export interface ImpersonateRequest {
    userId: string;
    reason: string;
}

export class ImpersonationFlow {
    constructor(private readonly deps: FlowDeps) {}

    async execute(req: ImpersonateRequest): Promise<AuthResponse> {
        const resp = await this.deps.ports.transport.request<AuthResponse>({
            method: 'POST',
            url: `${this.deps.apiBaseUrl}/admin/users/${encodeURIComponent(req.userId)}/impersonate`,
            body: { reason: req.reason },
        });
        await ensureOk(resp);
        return resp.body;
    }
}
