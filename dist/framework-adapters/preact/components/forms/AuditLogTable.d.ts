import type { AuditLogQuery } from '../../../../core/flows/audit-log.flow.js';
import type { AuthClient } from '../../../../core/auth-client.js';
/**
 * Paginated audit-log table. Admin-only — server gates the underlying
 * `/admin/audit-log` endpoint, so render this inside a
 * `<RoleGate anyOf=['system_admin','super_admin']>` wrapper.
 *
 * Filters surface as inline inputs above the table:
 *   - Action — exact or glob prefix (e.g. `login.*`)
 *   - User id — UUID, no validation here (server rejects malformed)
 *
 * Date filtering and org-id filtering are supported by the underlying
 * flow but kept off the default UI surface — most operators want
 * recent activity, and adding date pickers would balloon the
 * component. Pass a custom `defaultQuery` to set them.
 */
export interface AuditLogTableProps {
    client?: AuthClient;
    /** Seed query — useful for "logs for this user" deep-links. */
    defaultQuery?: AuditLogQuery;
    pageSize?: number;
    className?: string;
}
export declare function AuditLogTable(props: AuditLogTableProps): import("preact").JSX.Element;
//# sourceMappingURL=AuditLogTable.d.ts.map