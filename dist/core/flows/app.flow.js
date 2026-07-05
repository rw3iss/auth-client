/**
 * App-scoped utility flows. Today this is just the public
 * registration-policy lookup — `GET /apps/{code}/registration-policy`
 * — which exposes the per-app UX hints (allowed email domains,
 * allowed auth methods, default org name) the server uses to gate
 * registrations.
 *
 * The endpoint is anonymous so a login/register form can pre-filter
 * SSO buttons + show domain hints BEFORE the user submits. The server
 * re-validates on the actual register call so the client signal is
 * UX only, never security.
 */
import { ensureOk } from './flow-deps.js';
export class AppFlow {
    deps;
    constructor(deps) {
        this.deps = deps;
    }
    /**
     * Fetch the public registration policy for an app. Anonymous —
     * no token required. Throws if the app code is unknown.
     */
    async getRegistrationPolicy(appCode) {
        const resp = await this.deps.ports.transport.request({
            method: 'GET',
            url: `${this.deps.apiBaseUrl}/apps/${encodeURIComponent(appCode)}/registration-policy`,
        });
        await ensureOk(resp);
        return resp.body;
    }
}
//# sourceMappingURL=app.flow.js.map