/**
 * Logout flows: per-session and logout-everywhere.
 *
 * The auth-server's /auth/logout requires the refresh token (so it can
 * revoke the right row) but does NOT require the access token; we still
 * skip the auth header to avoid leaking which session was active.
 * /auth/logout/all DOES require the access token — it's a protected
 * endpoint that identifies the user via the JWT and bumps their token
 * version.
 */
import { ensureOk } from './flow-deps.js';
export class LogoutFlow {
    deps;
    constructor(deps) {
        this.deps = deps;
    }
    async execute(req) {
        const resp = await this.deps.ports.transport.request({
            method: 'POST',
            url: `${this.deps.apiBaseUrl}/auth/logout`,
            body: req,
            skipAuth: true,
        });
        await ensureOk(resp);
    }
    async executeAll() {
        const resp = await this.deps.ports.transport.request({
            method: 'POST',
            url: `${this.deps.apiBaseUrl}/auth/logout/all`,
        });
        await ensureOk(resp);
    }
}
//# sourceMappingURL=logout.flow.js.map