/**
 * Session management. Calls the authenticated `/auth/sessions` surface:
 *
 *   - `list()` — every active session for the current user
 *   - `terminate(sessionId)` — revoke one session (the user's own or
 *     someone else's via admin paths).
 *
 * The currently-authenticated session is included in the list and
 * marked `is_current=true` in the response so UIs can disable the
 * "terminate" affordance on that row (terminating yourself is fine,
 * but it logs the caller out — usually surprising).
 */
import { ensureOk } from './flow-deps.js';
export class SessionsFlow {
    deps;
    constructor(deps) {
        this.deps = deps;
    }
    /**
     * GET /auth/sessions — current user's active sessions.
     *
     * The auth-server returns a bare JSON array (`[ {…}, {…} ]`), not
     * a wrapped object. Earlier SDK builds expected `{ sessions: […] }`
     * and so silently returned `[]` against the real server — that's
     * why `<SessionsList>` rendered "No active sessions" for everyone.
     */
    async list() {
        const resp = await this.deps.ports.transport.request({
            method: 'GET',
            url: `${this.deps.apiBaseUrl}/auth/sessions`,
        });
        await ensureOk(resp);
        return resp.body ?? [];
    }
    /**
     * DELETE /auth/sessions/{sessionId} — revoke a specific session.
     * If `sessionId` is the caller's own, they'll be logged out as a
     * side-effect (the next authenticated request fails 401, which
     * triggers the AuthClient's clear-and-emit path).
     */
    async terminate(sessionId) {
        const resp = await this.deps.ports.transport.request({
            method: 'DELETE',
            url: `${this.deps.apiBaseUrl}/auth/sessions/${encodeURIComponent(sessionId)}`,
        });
        await ensureOk(resp);
    }
}
//# sourceMappingURL=sessions.flow.js.map