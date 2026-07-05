/**
 * Audit-log read access. Admin-only — server gates behind adminChain.
 * Page-size capped at 200 server-side; client passes whatever the
 * caller specified and the server rounds down.
 */
import { ensureOk } from './flow-deps.js';
export class AuditLogFlow {
    deps;
    constructor(deps) {
        this.deps = deps;
    }
    /** GET /admin/audit-log — paginated entries newest-first. */
    async list(q = {}) {
        const params = new URLSearchParams();
        if (q.action)
            params.set('action', q.action);
        if (q.userId)
            params.set('user_id', q.userId);
        if (q.organizationId)
            params.set('organization_id', q.organizationId);
        if (q.since)
            params.set('since', q.since);
        if (q.until)
            params.set('until', q.until);
        if (q.page)
            params.set('page', String(q.page));
        if (q.pageSize)
            params.set('page_size', String(q.pageSize));
        const qs = params.toString();
        const resp = await this.deps.ports.transport.request({
            method: 'GET',
            url: `${this.deps.apiBaseUrl}/admin/audit-log${qs ? '?' + qs : ''}`,
        });
        await ensureOk(resp);
        return resp.body ?? { entries: [], page: 1, page_size: 50, total: 0 };
    }
}
//# sourceMappingURL=audit-log.flow.js.map