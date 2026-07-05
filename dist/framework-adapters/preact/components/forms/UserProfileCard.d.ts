import type { AuthClient } from '../../../../core/auth-client.js';
/**
 * Identity card showing the current user — avatar, name, email, org
 * context, roles, and impersonation banner when active. Strictly a
 * read-only view of the AuthClient snapshot; renders nothing when
 * anonymous (use under `<ProtectedRoute>`).
 *
 * Useful as a header drop-in or as the body of a /settings page.
 */
export interface UserProfileCardProps {
    client?: AuthClient;
    /** Show roles + permissions counts. Default true. */
    showRoles?: boolean;
    className?: string;
}
export declare function UserProfileCard(props: UserProfileCardProps): import("preact").JSX.Element | null;
//# sourceMappingURL=UserProfileCard.d.ts.map