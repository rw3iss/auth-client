/** @jsxImportSource preact */
import { useEffect, useRef, useState } from 'preact/hooks';
import { useAuth } from '../../hooks.js';
import { UserAvatar } from './UserAvatar.js';
import { LogoutButton } from './LogoutButton.js';
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

export function UserMenu(props: UserMenuProps) {
    const snap = useAuth(props.client);
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
        if (!open) return;
        const onDown = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setOpen(false);
        };
        document.addEventListener('mousedown', onDown);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('mousedown', onDown);
            document.removeEventListener('keydown', onKey);
        };
    }, [open]);
    if (snap.status !== 'authenticated') return null;
    const claims = snap.claims;
    const displayName =
        claims?.display_name ??
        (`${claims?.first_name ?? ''} ${claims?.last_name ?? ''}`.trim() || snap.user?.email);
    const interactiveIdentity = !!(props.onIdentityClick || props.identityHref);
    const identityInner = (
        <>
            <div class="vauth-user-menu-name">{displayName}</div>
            <div class="vauth-user-menu-email">{snap.user?.email}</div>
            {claims?.org_name && <div class="vauth-user-menu-org">{claims.org_name}</div>}
        </>
    );
    const onIdentity = () => {
        props.onIdentityClick?.();
        setOpen(false);
    };
    return (
        <div class="vauth-user-menu" ref={ref}>
            <button
                type="button"
                class="vauth-user-menu-trigger"
                aria-haspopup="true"
                aria-expanded={open}
                onClick={() => setOpen((o) => !o)}
            >
                <UserAvatar size={32} {...(props.client !== undefined && { client: props.client })} />
            </button>
            {open && (
                <div class="vauth-user-menu-panel" role="menu">
                    {props.identityHref ? (
                        <a
                            class="vauth-user-menu-identity vauth-user-menu-identity-link"
                            href={props.identityHref}
                            role="menuitem"
                            onClick={() => setOpen(false)}
                        >
                            {identityInner}
                        </a>
                    ) : interactiveIdentity ? (
                        <button
                            type="button"
                            class="vauth-user-menu-identity vauth-user-menu-identity-link"
                            role="menuitem"
                            onClick={onIdentity}
                        >
                            {identityInner}
                        </button>
                    ) : (
                        <div class="vauth-user-menu-identity">{identityInner}</div>
                    )}
                    {props.extra && <div class="vauth-user-menu-extra">{props.extra}</div>}
                    <LogoutButton variant="ghost" className="vauth-user-menu-logout" {...(props.client !== undefined && { client: props.client })} />
                </div>
            )}
        </div>
    );
}
