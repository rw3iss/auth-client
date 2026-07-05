/** @jsxImportSource preact */
import type { ComponentChildren } from 'preact';
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
export declare function UsersTable(props: UsersTableProps): import("preact").JSX.Element;
//# sourceMappingURL=UsersTable.d.ts.map