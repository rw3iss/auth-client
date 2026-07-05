/**
 * M2M clients admin flow — CRUD over `/admin/m2m-clients` for
 * back-office UIs (the "Services" registry).
 *
 * An m2m client is a MACHINE credential for the auth-server's OAuth2
 * client_credentials grant: client_id + secret + scopes. It is
 * deliberately unrelated to the `apps` registry — apps are user-facing
 * login surfaces issuing USER tokens; m2m clients mint SERVICE tokens
 * (`token_type: "service"`) for backend-to-backend calls (see the
 * server's docs + `auth-server-laravel/docs/SERVICE_TOKENS.md`).
 *
 * Gating: every route here is **systemAdminChain** (system_admin
 * ONLY — even super_admin is excluded; these credentials sit below
 * every other admin tier). The SDK doesn't pre-check the caller's
 * role — the server is the source of truth; UI tiers should hide the
 * affordances behind <RoleGate roles={['system_admin']}>.
 *
 * Secret lifecycle: the plaintext `client_secret` appears EXACTLY
 * once, in the create() response. The server stores only a bcrypt
 * hash. Lost secret ⇒ rotate (create a replacement, revoke the old).
 *
 * NOTE — deliberately NOT included here: the client_credentials grant
 * itself (`POST /oauth/token`). Minting service tokens requires the
 * secret, which must never live in a browser; that half belongs to
 * the backend SDKs (`@rw3iss/auth-server-ts`/`-nest`,
 * `rw3iss/auth-server-php`/`-laravel`).
 */
import { ensureOk } from './flow-deps.js';
export class M2MFlow {
    deps;
    constructor(deps) {
        this.deps = deps;
    }
    /**
     * GET /admin/m2m-clients — every non-revoked client. (The server
     * wraps the array as `{ clients: [...] }`; unwrapped here.)
     */
    async list() {
        const resp = await this.deps.ports.transport.request({
            method: 'GET',
            url: `${this.deps.apiBaseUrl}/admin/m2m-clients`,
        });
        await ensureOk(resp);
        return resp.body?.clients ?? [];
    }
    /** GET /admin/m2m-clients/{id} — one client row (no secret). */
    async get(id) {
        const resp = await this.deps.ports.transport.request({
            method: 'GET',
            url: `${this.deps.apiBaseUrl}/admin/m2m-clients/${encodeURIComponent(id)}`,
        });
        await ensureOk(resp);
        return resp.body;
    }
    /**
     * POST /admin/m2m-clients — register a machine credential. The
     * response carries the plaintext `client_secret` — the ONLY time
     * it is ever visible. Surface it once, then drop it.
     */
    async create(body) {
        const resp = await this.deps.ports.transport.request({
            method: 'POST',
            url: `${this.deps.apiBaseUrl}/admin/m2m-clients`,
            body,
        });
        await ensureOk(resp);
        return resp.body;
    }
    /**
     * DELETE /admin/m2m-clients/{id} — soft-revoke. Outstanding
     * service tokens die within their own lifetime (~15m); new grants
     * fail immediately.
     */
    async revoke(id) {
        const resp = await this.deps.ports.transport.request({
            method: 'DELETE',
            url: `${this.deps.apiBaseUrl}/admin/m2m-clients/${encodeURIComponent(id)}`,
        });
        await ensureOk(resp);
    }
}
//# sourceMappingURL=m2m.flow.js.map