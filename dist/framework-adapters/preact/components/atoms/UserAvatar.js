import { jsx as _jsx } from "preact/jsx-runtime";
/** @jsxImportSource preact */
import { useAuth } from '../../hooks.js';
function initials(name, email) {
    const source = (name ?? email ?? '').trim();
    if (!source)
        return '?';
    const parts = source.split(/\s+/).filter(Boolean);
    if (parts.length >= 2)
        return (parts[0][0] + parts[1][0]).toUpperCase();
    return source.slice(0, 2).toUpperCase();
}
function hueFromId(id) {
    if (!id)
        return 0;
    let h = 0;
    for (let i = 0; i < id.length; i++)
        h = (h * 31 + id.charCodeAt(i)) | 0;
    return Math.abs(h) % 360;
}
export function UserAvatar(props) {
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
    return (_jsx("span", { class: `vauth-avatar ${props.className ?? ''}`, style: style, "aria-label": displayName ?? email ?? 'Anonymous', title: displayName ?? email ?? '', children: text }));
}
//# sourceMappingURL=UserAvatar.js.map