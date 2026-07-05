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
import type {
    M2MClientRecord,
    CreateM2MClientRequest,
    CreateM2MClientResponse,
} from '../flows/m2m.flow.js';

export class ServicesModule {
    constructor(private readonly ctx: ModuleContext) {}

    /** GET /admin/m2m-clients — list non-revoked machine credentials. */
    async list(): Promise<M2MClientRecord[]> {
        this.ctx.guard('listM2MClients');
        return this.ctx.flows.m2m.list();
    }

    /** GET /admin/m2m-clients/{id} — one client (never the secret). */
    async get(id: string): Promise<M2MClientRecord> {
        this.ctx.guard('getM2MClient');
        return this.ctx.flows.m2m.get(id);
    }

    /** POST /admin/m2m-clients — mint a machine credential. The
     *  response's `client_secret` is shown exactly ONCE. */
    async create(body: CreateM2MClientRequest): Promise<CreateM2MClientResponse> {
        this.ctx.guard('createM2MClient');
        return this.ctx.flows.m2m.create(body);
    }

    /** DELETE /admin/m2m-clients/{id} — soft-revoke. */
    async revoke(id: string): Promise<void> {
        this.ctx.guard('revokeM2MClient');
        return this.ctx.flows.m2m.revoke(id);
    }
}
