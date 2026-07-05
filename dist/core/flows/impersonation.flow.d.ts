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
import { type FlowDeps } from './flow-deps.js';
export interface ImpersonateRequest {
    userId: string;
    reason: string;
}
export declare class ImpersonationFlow {
    private readonly deps;
    constructor(deps: FlowDeps);
    execute(req: ImpersonateRequest): Promise<AuthResponse>;
}
//# sourceMappingURL=impersonation.flow.d.ts.map