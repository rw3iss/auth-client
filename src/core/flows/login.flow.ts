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
import { ensureOk, type FlowDeps } from './flow-deps.js';

export interface LoginRequest {
    email: string;
    password: string;
    organization_id?: string | undefined;
    remember_me?: boolean | undefined;
    two_factor_code?: string | undefined;
    app_code?: string | undefined;
}

export class LoginFlow {
    constructor(private readonly deps: FlowDeps) {}

    async execute(req: LoginRequest): Promise<AuthResponse> {
        const resp = await this.deps.ports.transport.request<AuthResponse>({
            method: 'POST',
            url: `${this.deps.apiBaseUrl}/auth/login`,
            body: req,
            // Login is the one place a stale auth header is harmful: it
            // would let the server see a token from a previous user
            // during a fresh login. Skip the header attachment.
            skipAuth: true,
        });

        // 2FA challenge: server returns 401 with requires_2fa:true. We
        // hand it back to the caller without throwing so the UI can
        // prompt for the code and retry.
        if (resp.status === 401 && isRequires2FA(resp.body)) {
            return resp.body;
        }

        await ensureOk(resp);
        return resp.body;
    }
}

function isRequires2FA(body: unknown): body is AuthResponse {
    if (typeof body !== 'object' || body === null) return false;
    return (body as { requires_2fa?: boolean }).requires_2fa === true;
}
