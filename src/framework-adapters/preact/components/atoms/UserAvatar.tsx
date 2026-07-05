/** @jsxImportSource preact */
import { useAuth } from '../../hooks.js';
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
    user?: { id?: string; email?: string; displayName?: string };
    className?: string;
}

function initials(name: string | undefined, email: string | undefined): string {
    const source = (name ?? email ?? '').trim();
    if (!source) return '?';
    const parts = source.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
    return source.slice(0, 2).toUpperCase();
}

function hueFromId(id: string | undefined): number {
    if (!id) return 0;
    let h = 0;
    for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
    return Math.abs(h) % 360;
}

export function UserAvatar(props: UserAvatarProps) {
    // Hooks must run unconditionally — call useAuth regardless of whether
    // `user` is supplied, then choose the source. Avoids the rule-of-hooks
    // breakage that would happen if the explicit-user branch skipped the hook.
    const snap = useAuth(props.client);

    const id = props.user?.id ?? snap.user?.id;
    const displayName = props.user?.displayName ?? snap.claims?.display_name;
    const email = props.user?.email ?? snap.user?.email;
    const hasSource = props.user !== undefined ? Boolean(id || email) : snap.user !== null;

    const size = props.size ?? 36;
    const hue = hueFromId(id);
    const text = initials(displayName, email);
    const style = {
        width: `${size}px`,
        height: `${size}px`,
        fontSize: `${Math.max(11, Math.floor(size * 0.4))}px`,
        background: hasSource ? `hsl(${hue} 60% 35%)` : 'var(--vauth-color-muted, #555)',
    };
    return (
        <span
            class={`vauth-avatar ${props.className ?? ''}`}
            style={style}
            aria-label={displayName ?? email ?? 'Anonymous'}
            title={displayName ?? email ?? ''}
        >
            {text}
        </span>
    );
}
