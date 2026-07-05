import type { LookupUserRecord } from '../../../../core/flows/admin.flow.js';
import type { AuthClient } from '../../../../core/auth-client.js';
/**
 * Admin user-edit panel. Surfaces the slice of admin operations a
 * back-office user-management page needs:
 *
 *   - Role assignment — toggle a curated list of role codes; calls
 *     `PUT /admin/users/{id}/roles`.
 *   - Set password — admin can reset without the user's current
 *     password; calls `POST /auth/admin/set-password`.
 *   - Hard-delete — calls `DELETE /admin/users/{id}/hard` (system_admin
 *     only on the server; we gate the button on `currentUserIsSystemAdmin`).
 *
 * Composes the `UserAvatar` atom for visual identity. Caller-gated:
 * always wrap this in `<RoleGate anyOf={['system_admin','super_admin']}>`
 * upstream — the server enforces but a gate prevents the UI from showing
 * up at all for non-admins.
 */
export interface AdminUserEditPanelProps {
    user: LookupUserRecord;
    client?: AuthClient;
    /** Role codes the admin can toggle. Default: a reasonable subset. */
    assignableRoles?: string[];
    /** Currently-assigned role codes. */
    currentRoles?: string[];
    /** Whether the caller is system_admin — gates the hard-delete affordance. */
    currentUserIsSystemAdmin?: boolean;
    /** Fired after a successful save action (any of roles / password). */
    onSaved?: () => void;
    /** Fired after a successful hard-delete; consumer navigates away. */
    onDeleted?: () => void;
    /**
     * Which sections to render, in case the consumer wants to lay them out
     * across its own columns. Defaults to all. (`danger` still also requires
     * `currentUserIsSystemAdmin`.) Sections:
     *   - `header`   — avatar + name + email
     *   - `roles`    — base-role toggles + save
     *   - `password` — admin set-password
     *   - `lockout`  — clear failed-login lockout (count + lock)
     *   - `danger`   — hard-delete
     */
    include?: Array<'header' | 'roles' | 'password' | 'lockout' | 'danger'>;
    className?: string;
}
export declare function AdminUserEditPanel(props: AdminUserEditPanelProps): import("preact").JSX.Element;
//# sourceMappingURL=AdminUserEditPanel.d.ts.map