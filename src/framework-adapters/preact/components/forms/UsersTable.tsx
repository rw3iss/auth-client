/** @jsxImportSource preact */
import type { ComponentChildren } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { useListUsers } from '../../actions.js';
import { UserAvatar } from '../atoms/UserAvatar.js';
import { roleLabels } from '@vendidit/auth-shared/constants';
import type { LookupUserRecord } from '../../../../core/flows/admin.flow.js';
import type { AuthClient } from '../../../../core/auth-client.js';

/**
 * Paginated users table — `GET /admin/users` with search + pagination.
 * Each row is clickable; `onRowClick` is the navigation hook (the
 * demo uses it to push to `/admin/users/:id`).
 *
 * Search debounces 300ms client-side so a fast typist doesn't fire
 * one request per keystroke. Page size defaults to 25 (matches the
 * server's default page size).
 */
export interface UsersTableProps {
    client?: AuthClient;
    pageSize?: number;
    onRowClick?: (user: LookupUserRecord) => void;
    className?: string;
    /** Restrict the list to one organization's members. Forwarded as
     *  `?organization_id=` on the wire. Change this prop to re-run the
     *  query — the table resets to page 1 on filter changes. */
    organizationId?: string;
    /** Restrict the list to one app's members. Forwarded as `?app_id=`.
     *  Server support for this filter is pending; older builds ignore
     *  it and return every user. */
    appId?: string;
    /** Optional slot rendered inside the header strip, to the right of
     *  the search input and before the count badge. Use it to inline
     *  filter dropdowns / actions on the same row as the search.
     *  Wraps gracefully on narrow viewports. */
    filters?: ComponentChildren;
}

export function UsersTable(props: UsersTableProps) {
    const list = useListUsers(props.client);
    const [items, setItems] = useState<LookupUserRecord[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const pageSize = props.pageSize ?? 25;

    // Debounce the search box. Tied to the input's value but applied
    // after 300ms of inactivity — cheap and avoids one request per keystroke.
    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search), 300);
        return () => clearTimeout(t);
    }, [search]);

    // Reset to page 1 whenever a filter changes — page numbers from
    // the previous filter would be off-by-many.
    useEffect(() => {
        setPage(1);
    }, [props.organizationId, props.appId]);

    useEffect(() => {
        const req: {
            page: number;
            pageSize: number;
            search?: string;
            organizationId?: string;
            appId?: string;
        } = { page, pageSize };
        if (debouncedSearch.trim()) req.search = debouncedSearch.trim();
        if (props.organizationId) req.organizationId = props.organizationId;
        if (props.appId) req.appId = props.appId;
        void list.run(req).then((result) => {
            setItems(result.users ?? []);
            setTotal(result.total ?? 0);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, debouncedSearch, pageSize, props.organizationId, props.appId]);

    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    return (
        <div class={`vauth-users-table ${props.className ?? ''}`}>
            <header class="vauth-users-table-header">
                <input
                    class="vauth-input vauth-users-table-search"
                    type="search"
                    placeholder="Search by email or name…"
                    value={search}
                    onInput={(e) => { setSearch((e.target as HTMLInputElement).value); setPage(1); }}
                />
                {props.filters && (
                    <div class="vauth-users-table-filters">{props.filters}</div>
                )}
                <span class="vauth-users-table-count">{total} users</span>
            </header>
            {list.error && <div class="vauth-error" role="alert">{list.error.message}</div>}
            <table>
                <thead>
                    <tr><th /><th>Email</th><th>Name</th><th>Roles</th><th>Status</th><th>Provider</th></tr>
                </thead>
                <tbody>
                    {items.map((u) => (
                        <tr
                            key={u.id}
                            class="vauth-users-table-row"
                            onClick={() => props.onRowClick?.(u)}
                            tabIndex={props.onRowClick ? 0 : -1}
                            role={props.onRowClick ? 'button' : undefined}
                        >
                            <td>
                                {/* Composes with the UserAvatar atom — avatars are
                                  * the canonical representation of a user across the
                                  * SDK, so a list row uses the same renderer as the
                                  * header / profile card. */}
                                <UserAvatar
                                    size={28}
                                    user={{
                                        id: u.id,
                                        email: u.email,
                                        ...(u.display_name && { displayName: u.display_name }),
                                    }}
                                />
                            </td>
                            <td>{u.email}</td>
                            <td>{u.display_name ?? (`${u.first_name ?? ''} ${u.last_name ?? ''}`.trim() || '—')}</td>
                            {/* Roles column: undefined = older server build, render '—';
                                empty = no roles assigned, render '—'; otherwise comma-join
                                labels via roleLabels (handles dynamic .name and code fallback). */}
                            <td>{u.roles && u.roles.length > 0 ? roleLabels(u.roles).join(', ') : '—'}</td>
                            <td>{u.status ?? '—'}</td>
                            <td>{u.auth_provider ?? '—'}</td>
                        </tr>
                    ))}
                    {items.length === 0 && !list.loading && (
                        <tr><td colSpan={6} class="vauth-users-table-empty">No users.</td></tr>
                    )}
                </tbody>
            </table>
            {totalPages > 1 && (
                <footer class="vauth-users-table-footer">
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

