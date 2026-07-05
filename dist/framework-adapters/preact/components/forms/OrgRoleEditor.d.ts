import type { AuthClient } from '../../../../core/auth-client.js';
/**
 * Custom org-role editor. Two columns:
 *
 *   Left: list of roles (system + custom). Click to select; selecting
 *   a custom role opens the editor on the right.
 *
 *   Right: name / description / permission picker. The permission
 *   picker is keyed off `/orgs/{orgId}/permissions/assignable` so
 *   the server gates which permissions an org admin can grant
 *   (org-system perms like `organizations:delete` stay off-limits
 *   even to org_admin custom-role authors — AUDIT C3).
 *
 * Built-in / system roles render as read-only and the delete button
 * is hidden on them. New roles are created via the "+ New role"
 * affordance in the list header.
 */
export interface OrgRoleEditorProps {
    client?: AuthClient;
    orgId?: string;
    className?: string;
}
export declare function OrgRoleEditor(props: OrgRoleEditorProps): import("preact").JSX.Element;
//# sourceMappingURL=OrgRoleEditor.d.ts.map