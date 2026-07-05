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
import { ensureOk } from './flow-deps.js';
export class LoginFlow {
    deps;
    constructor(deps) {
        this.deps = deps;
    }
    async execute(req) {
        const resp = await this.deps.ports.transport.request({
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
function isRequires2FA(body) {
    if (typeof body !== 'object' || body === null)
        return false;
    return body.requires_2fa === true;
}
//# sourceMappingURL=login.flow.js.map