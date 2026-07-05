/** @jsxImportSource preact */
import { useEffect, useState } from 'preact/hooks';
import { useListAuditLog } from '../../actions.js';
import type {
    AuditLogEntry,
    AuditLogQuery,
} from '../../../../core/flows/audit-log.flow.js';
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

export function AuditLogTable(props: AuditLogTableProps) {
    const list = useListAuditLog(props.client);
    const [items, setItems] = useState<AuditLogEntry[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(props.defaultQuery?.page ?? 1);
    const [actionFilter, setActionFilter] = useState(props.defaultQuery?.action ?? '');
    const [userFilter, setUserFilter] = useState(props.defaultQuery?.userId ?? '');
    const [debouncedAction, setDebouncedAction] = useState(actionFilter);
    const [debouncedUser, setDebouncedUser] = useState(userFilter);
    const pageSize = props.pageSize ?? props.defaultQuery?.pageSize ?? 50;

    useEffect(() => {
        const t = setTimeout(() => {
            setDebouncedAction(actionFilter);
            setDebouncedUser(userFilter);
        }, 300);
        return () => clearTimeout(t);
    }, [actionFilter, userFilter]);

    useEffect(() => {
        const q: AuditLogQuery = { page, pageSize };
        if (debouncedAction.trim()) q.action = debouncedAction.trim();
        if (debouncedUser.trim()) q.userId = debouncedUser.trim();
        void list.run(q).then((result) => {
            setItems(result.entries ?? []);
            setTotal(result.total ?? 0);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, debouncedAction, debouncedUser, pageSize]);

    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    return (
        <div class={`vauth-audit-table ${props.className ?? ''}`}>
            <header class="vauth-audit-table-header">
                <input
                    class="vauth-input"
                    type="search"
                    placeholder='Action: login.success or login.*'
                    value={actionFilter}
                    onInput={(e) => { setActionFilter((e.target as HTMLInputElement).value); setPage(1); }}
                />
                <input
                    class="vauth-input"
                    type="search"
                    placeholder="User id"
                    value={userFilter}
                    onInput={(e) => { setUserFilter((e.target as HTMLInputElement).value); setPage(1); }}
                />
                <span class="vauth-audit-table-count">{total} events</span>
            </header>
            {list.error && <div class="vauth-error" role="alert">{list.error.message}</div>}
            <table>
                <thead>
                    <tr><th>At</th><th>Action</th><th>Actor</th><th>Subject</th><th>Details</th></tr>
                </thead>
                <tbody>
                    {items.map((e) => (
                        <tr key={e.id}>
                            <td><time>{new Date(e.created_at).toLocaleString()}</time></td>
                            <td><code>{e.action}</code></td>
                            <td>{shortId(e.user_id)}</td>
                            <td>{shortId((e.details?.subject_user_id as string) ?? undefined)}</td>
                            <td><pre class="vauth-audit-details">{summarizeDetails(e.details)}</pre></td>
                        </tr>
                    ))}
                    {items.length === 0 && !list.loading && (
                        <tr><td colSpan={5} class="vauth-audit-empty">No events match these filters.</td></tr>
                    )}
                </tbody>
            </table>
            {totalPages > 1 && (
                <footer class="vauth-audit-table-footer">
                    <button
                        type="button"
                        class="vauth-btn vauth-btn-ghost vauth-btn-sm"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page <= 1 || list.loading}
                    >Previous</button>
                    <span>Page {page} of {totalPages}</span>
                    <button
                        type="button"
                        class="vauth-btn vauth-btn-ghost vauth-btn-sm"
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page >= totalPages || list.loading}
                    >Next</button>
                </footer>
            )}
        </div>
    );
}

function shortId(id?: string): string {
    if (!id) return '—';
    return id.slice(0, 8) + '…';
}

function summarizeDetails(d?: Record<string, unknown>): string {
    if (!d) return '';
    const pairs = Object.entries(d)
        .filter(([k]) => k !== 'subject_user_id') // already shown as a column
        .map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : String(v)}`);
    return pairs.join('\n');
}
