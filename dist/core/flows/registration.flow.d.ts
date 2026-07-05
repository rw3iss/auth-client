/**
 * Registration flow. Wraps POST /auth/register.
 *
 * The server supports three modes via the `mode` field (auth-server
 * AUDIT B7a):
 *
 *   - "register" (default): refuse if email already exists.
 *   - "register_or_login": treat existing email as a login attempt.
 *   - "register_or_return": service-only mode — returns the existing
 *     user instead of erroring. The SDK does NOT expose this — it
 *     requires a service-principal token, which a browser shouldn't have.
 *
 * For simplicity the SDK only surfaces the two browser-safe modes via
 * the `loginIfExists` boolean.
 */
import type { AuthResponse } from '../types.js';
import { type FlowDeps } from './flow-deps.js';
export interface RegisterRequest {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    organization_id?: string | undefined;
    organization_name?: string | undefined;
    invite_code?: string | undefined;
    invite_token?: string | undefined;
    app_code?: string | undefined;
    mode?: 'register' | 'register_or_login';
}
export declare class RegistrationFlow {
    private readonly deps;
    constructor(deps: FlowDeps);
    register(req: RegisterRequest): Promise<AuthResponse>;
}
//# sourceMappingURL=registration.flow.d.ts.map