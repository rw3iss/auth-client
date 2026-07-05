export class AuditModule {
    ctx;
    constructor(ctx) {
        this.ctx = ctx;
    }
    /** GET /admin/audit-log — paginated, admin-only. */
    async list(q) {
        this.ctx.guard('listAuditLog');
        return this.ctx.flows.auditLog.list(q);
    }
}
//# sourceMappingURL=audit.module.js.map