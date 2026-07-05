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
 * the backend SDKs (`@vendidit/auth-server-ts`/`-nest`,
 * `vendidit/auth-server-php`/`-laravel`).
 */
import { type FlowDeps } from './flow-deps.js';
import type { M2MClientRecord, CreateM2MClientRequest, CreateM2MClientResponse } from '@vendidit/auth-shared/dto';
export type { M2MClientRecord, CreateM2MClientRequest, CreateM2MClientResponse, };
export declare class M2MFlow {
    private readonly deps;
    constructor(deps: FlowDeps);
    /**
     * GET /admin/m2m-clients — every non-revoked client. (The server
     * wraps the array as `{ clients: [...] }`; unwrapped here.)
     */
    list(): Promise<M2MClientRecord[]>;
    /** GET /admin/m2m-clients/{id} — one client row (no secret). */
    get(id: string): Promise<M2MClientRecord>;
    /**
     * POST /admin/m2m-clients — register a machine credential. The
     * response carries the plaintext `client_secret` — the ONLY time
     * it is ever visible. Surface it once, then drop it.
     */
    create(body: CreateM2MClientRequest): Promise<CreateM2MClientResponse>;
    /**
     * DELETE /admin/m2m-clients/{id} — soft-revoke. Outstanding
     * service tokens die within their own lifetime (~15m); new grants
     * fail immediately.
     */
    revoke(id: string): Promise<void>;
}
//# sourceMappingURL=m2m.flow.d.ts.map