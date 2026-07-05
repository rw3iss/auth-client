export class ServicesModule {
    ctx;
    constructor(ctx) {
        this.ctx = ctx;
    }
    /** GET /admin/m2m-clients — list non-revoked machine credentials. */
    async list() {
        this.ctx.guard('listM2MClients');
        return this.ctx.flows.m2m.list();
    }
    /** GET /admin/m2m-clients/{id} — one client (never the secret). */
    async get(id) {
        this.ctx.guard('getM2MClient');
        return this.ctx.flows.m2m.get(id);
    }
    /** POST /admin/m2m-clients — mint a machine credential. The
     *  response's `client_secret` is shown exactly ONCE. */
    async create(body) {
        this.ctx.guard('createM2MClient');
        return this.ctx.flows.m2m.create(body);
    }
    /** DELETE /admin/m2m-clients/{id} — soft-revoke. */
    async revoke(id) {
        this.ctx.guard('revokeM2MClient');
        return this.ctx.flows.m2m.revoke(id);
    }
}
//# sourceMappingURL=services.module.js.map