/**
 * Audit-log read access. Admin-only — server gates behind adminChain.
 * Page-size capped at 200 server-side; client passes whatever the
 * caller specified and the server rounds down.
 */
import { type FlowDeps } from './flow-deps.js';
import type { AuditLogEntry, AuditLogQuery, AuditLogResult } from '@rw3iss/auth-shared';
export type { AuditLogEntry, AuditLogQuery, AuditLogResult };
export declare class AuditLogFlow {
    private readonly deps;
    constructor(deps: FlowDeps);
    /** GET /admin/audit-log — paginated entries newest-first. */
    list(q?: AuditLogQuery): Promise<AuditLogResult>;
}
//# sourceMappingURL=audit-log.flow.d.ts.map