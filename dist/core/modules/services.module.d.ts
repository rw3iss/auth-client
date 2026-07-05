/**
 * `client.services` — the m2m (machine-to-machine) client registry
 * (`/admin/m2m-clients`, system_admin ONLY). These mint SERVICE
 * tokens via the OAuth2 client_credentials grant — deliberately
 * unrelated to the user-facing apps registry (`client.apps`).
 *
 * The grant itself (`POST /oauth/token`) is intentionally NOT here:
 * it requires the client secret, which never belongs in a browser —
 * use the backend SDKs.
 */
import type { ModuleContext } from '../module-context.js';
import type { M2MClientRecord, CreateM2MClientRequest, CreateM2MClientResponse } from '../flows/m2m.flow.js';
export declare class ServicesModule {
    private readonly ctx;
    constructor(ctx: ModuleContext);
    /** GET /admin/m2m-clients — list non-revoked machine credentials. */
    list(): Promise<M2MClientRecord[]>;
    /** GET /admin/m2m-clients/{id} — one client (never the secret). */
    get(id: string): Promise<M2MClientRecord>;
    /** POST /admin/m2m-clients — mint a machine credential. The
     *  response's `client_secret` is shown exactly ONCE. */
    create(body: CreateM2MClientRequest): Promise<CreateM2MClientResponse>;
    /** DELETE /admin/m2m-clients/{id} — soft-revoke. */
    revoke(id: string): Promise<void>;
}
//# sourceMappingURL=services.module.d.ts.map