import type { AuthClient } from '../../../../core/auth-client.js';
/**
 * Square user avatar. Renders the user's `display_name` initials (or
 * email's first letter) over a deterministic colored background derived
 * from the user id, so the same user gets the same color across mounts
 * without storing palette state.
 *
 * Falls back to a "?" glyph when no user is logged in — callers can
 * gate render with `<ProtectedRoute>` if they want to hide entirely.
 */
export interface UserAvatarProps {
    client?: AuthClient;
    /** Pixel size for both width and height. Default 36. */
    size?: number;
    /**
     * Explicit user data. When provided, overrides the auth-snapshot
     * source — useful in lists (admin user tables, members lists)
     * where each row represents someone OTHER than the signed-in
     * caller. When omitted, defaults to the snapshot user.
     */
    user?: {
        id?: string;
        email?: string;
        displayName?: string;
    };
    className?: string;
}
export declare function UserAvatar(props: UserAvatarProps): import("preact").JSX.Element;
//# sourceMappingURL=UserAvatar.d.ts.map