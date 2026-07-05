/**
 * Refresh flow. Wraps POST /auth/refresh.
 *
 * The server's family-aware rotation logic (AUDIT 1.9) means refresh is
 * one-shot: the presented refresh token is revoked, a new pair is minted,
 * and the family chain extends by one. Concurrent presentations of the
 * SAME refresh token after the first wins trip family-revoke and end
 * the session entirely.
 *
 * That's why the AuthClient wraps this flow in a RefreshMutex — every
 * call inside one tab coalesces. Cross-tab coalescing is handled
 * separately via BroadcastChannel.
 *
 * Context-switching at refresh: optional `organization_id` and `app_code`
 * fields let the client switch tenants / app contexts without a fresh
 * password login. The server re-verifies membership and re-mints the
 * permissions claim accordingly.
 */
import { ensureOk } from './flow-deps.js';
export class RefreshFlow {
    deps;
    constructor(deps) {
        this.deps = deps;
    }
    async execute(req) {
        const resp = await this.deps.ports.transport.request({
            method: 'POST',
            url: `${this.deps.apiBaseUrl}/auth/refresh`,
            body: req,
            skipAuth: true,
        });
        await ensureOk(resp);
        return resp.body;
    }
}
//# sourceMappingURL=refresh.flow.js.map