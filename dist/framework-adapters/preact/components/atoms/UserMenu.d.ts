import type { AuthClient } from '../../../../core/auth-client.js';
/**
 * Header-level user menu — avatar trigger + dropdown with profile
 * info and sign-out. Anchors absolute-positioned panel to the
 * trigger; closes on outside click + Escape.
 *
 * Drop into your app header alongside `AuthLoading` / `GuestOnly` so
 * the trigger renders only when authenticated:
 *
 *   <ProtectedRoute fallback={<a href="/login">Sign in</a>}>
 *     <UserMenu />
 *   </ProtectedRoute>
 */
export interface UserMenuProps {
    client?: AuthClient;
    /** Slot rendered above the sign-out button — e.g. settings link. */
    extra?: preact.ComponentChildren;
    /**
     * Make the identity block (name + email) interactive — e.g. link to
     * the user's profile. Provide `onIdentityClick` for SPA routers
     * (called, then the menu closes) and/or `identityHref` for plain
     * anchor navigation. When neither is set the block is static.
     */
    onIdentityClick?: () => void;
    identityHref?: string;
}
export declare function UserMenu(props: UserMenuProps): import("preact").JSX.Element | null;
//# sourceMappingURL=UserMenu.d.ts.map