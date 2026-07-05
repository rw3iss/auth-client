import type { AuthClient } from '../../../../core/auth-client.js';
/**
 * Admin tool — paste a list of emails (or ids), hit Look up, render
 * the result table. Backed by POST /admin/users/lookup. Requires
 * an admin token; the form surfaces a 403 as a clear error.
 *
 * Designed for back-office workflows where someone has a spreadsheet
 * of identifiers and needs to inspect those accounts.
 */
export interface UserLookupTableProps {
    client?: AuthClient;
    /** Default placeholder text for the input. */
    placeholder?: string;
    className?: string;
}
export declare function UserLookupTable(props: UserLookupTableProps): import("preact").JSX.Element;
//# sourceMappingURL=UserLookupTable.d.ts.map