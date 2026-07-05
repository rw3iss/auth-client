/**
 * `client.audit` — the platform audit log (`/admin/audit-log`,
 * system_admin / super_admin).
 */
import type { ModuleContext } from '../module-context.js';
import type { AuditLogQuery, AuditLogResult } from '../flows/audit-log.flow.js';

export class AuditModule {
    constructor(private readonly ctx: ModuleContext) {}

    /** GET /admin/audit-log — paginated, admin-only. */
    async list(q?: AuditLogQuery): Promise<AuditLogResult> {
        this.ctx.guard('listAuditLog');
        return this.ctx.flows.auditLog.list(q);
    }
}
