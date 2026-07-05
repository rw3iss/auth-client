/** @jsxImportSource preact */
import { useAuth } from '../../hooks.js';
import { UserAvatar } from '../atoms/UserAvatar.js';
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

export function UserProfileCard(props: UserProfileCardProps) {
    const snap = useAuth(props.client);
    if (snap.status !== 'authenticated') return null;
    const claims = snap.claims;
    const showRoles = props.showRoles !== false;
    return (
        <div class={`vauth-profile-card ${props.className ?? ''}`}>
            <UserAvatar size={56} {...(props.client !== undefined && { client: props.client })} />
            <div class="vauth-profile-card-body">
                <h3 class="vauth-profile-card-name">
                    {claims?.display_name ?? (`${claims?.first_name ?? ''} ${claims?.last_name ?? ''}`.trim() || snap.user?.email)}
                </h3>
                <div class="vauth-profile-card-email">{snap.user?.email}</div>
                {claims?.org_name && (
                    <div class="vauth-profile-card-org">
                        <span class="vauth-profile-card-label">Organization</span>
                        <span>{claims.org_name}</span>
                    </div>
                )}
                {showRoles && claims?.roles && claims.roles.length > 0 && (
                    <div class="vauth-profile-card-roles">
                        {claims.roles.map((r) => <span key={r} class="vauth-tag">{r}</span>)}
                    </div>
                )}
                {snap.isImpersonating && claims?.imp_email && (
                    <div class="vauth-profile-card-imp" role="status">
                        Impersonating — acting on behalf of this user from <strong>{claims.imp_email}</strong>
                    </div>
                )}
            </div>
        </div>
    );
}
