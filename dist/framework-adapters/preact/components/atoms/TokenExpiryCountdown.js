import { jsx as _jsx } from "preact/jsx-runtime";
/** @jsxImportSource preact */
import { useEffect, useState } from 'preact/hooks';
import { useAuth } from '../../hooks.js';
function defaultFormat(seconds) {
    if (seconds <= 0)
        return 'expired';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m >= 60)
        return `${Math.floor(m / 60)}h ${m % 60}m`;
    if (m >= 1)
        return `${m}m ${s.toString().padStart(2, '0')}s`;
    return `${s}s`;
}
export function TokenExpiryCountdown(props) {
    const snap = useAuth(props.client);
    const exp = snap.claims?.exp ?? null;
    const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));
    useEffect(() => {
        if (snap.status !== 'authenticated')
            return;
        const id = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
        return () => clearInterval(id);
    }, [snap.status]);
    if (snap.status !== 'authenticated' || !exp)
        return null;
    const seconds = exp - now;
    const text = (props.format ?? defaultFormat)(seconds);
    return (_jsx("span", { class: `vauth-token-countdown ${seconds <= 60 ? 'vauth-warn' : ''} ${props.className ?? ''}`, children: text }));
}
//# sourceMappingURL=TokenExpiryCountdown.js.map