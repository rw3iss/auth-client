/**
 * `client.audit` — the platform audit log (`/admin/audit-log`,
 * system_admin / super_admin).
 */
import type { ModuleContext } from '../module-context.js';
import type { AuditLogQuery, AuditLogResult } from '../flows/audit-log.flow.js';
export declare class AuditModule {
    private readonly ctx;
    constructor(ctx: ModuleContext);
    /** GET /admin/audit-log — paginated, admin-only. */
    list(q?: AuditLogQuery): Promise<AuditLogResult>;
}
//# sourceMappingURL=audit.module.d.ts.map