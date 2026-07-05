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
import { ensureOk } from './flow-deps.js';
export class RegistrationFlow {
    deps;
    constructor(deps) {
        this.deps = deps;
    }
    async register(req) {
        const resp = await this.deps.ports.transport.request({
            method: 'POST',
            url: `${this.deps.apiBaseUrl}/auth/register`,
            body: req,
            skipAuth: true,
        });
        await ensureOk(resp);
        return resp.body;
    }
}
//# sourceMappingURL=registration.flow.js.map