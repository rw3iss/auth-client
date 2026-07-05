import type { AuthClient } from '../../../../core/auth-client.js';
/**
 * Org members table — list everyone in the current (or specified) org
 * with a "remove" affordance per row. Reads `useOrg()` for the active
 * org id by default; pass `orgId` to target a different org the
 * caller administers.
 *
 * Requires `org:members:read` (list) and `org:members:remove` (remove)
 * — the server-side gate is the source of truth. The remove button
 * surfaces server 403s as inline errors.
 */
export interface MembersListProps {
    client?: AuthClient;
    /** Defaults to the current org from the auth snapshot. */
    orgId?: string;
    className?: string;
}
export declare function MembersList(props: MembersListProps): import("preact").JSX.Element;
//# sourceMappingURL=MembersList.d.ts.map