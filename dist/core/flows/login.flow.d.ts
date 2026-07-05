/**
 * Password login flow. Wraps POST /auth/login.
 *
 * The server's response is one of three shapes:
 *
 *   1. Success → { user, tokens, roles, permissions, organization? }
 *   2. 2FA required → 401 with { requires_2fa: true } body. We surface
 *      this as a non-throwing return so consumers can prompt for code
 *      and resubmit.
 *   3. Hard failure → 4xx with error envelope. fromHttpResponse maps to
 *      the right AuthError subclass.
 */
import type { AuthResponse } from '../types.js';
import { type FlowDeps } from './flow-deps.js';
export interface LoginRequest {
    email: string;
    password: string;
    organization_id?: string | undefined;
    remember_me?: boolean | undefined;
    two_factor_code?: string | undefined;
    app_code?: string | undefined;
}
export declare class LoginFlow {
    private readonly deps;
    constructor(deps: FlowDeps);
    execute(req: LoginRequest): Promise<AuthResponse>;
}
//# sourceMappingURL=login.flow.d.ts.map