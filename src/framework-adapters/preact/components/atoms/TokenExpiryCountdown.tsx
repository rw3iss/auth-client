/** @jsxImportSource preact */
import { useEffect, useState } from 'preact/hooks';
import { useAuth } from '../../hooks.js';
import type { AuthClient } from '../../../../core/auth-client.js';

/**
 * Live countdown to the cached access token's expiry. Re-renders once
 * per second while the user is authenticated. After expiry, shows
 * "expired" until the auto-refresh path mints a new token.
 *
 * The countdown reads `cachedClaims.exp` from the AuthClient snapshot,
 * NOT a separate timer — so it stays consistent across tabs and
 * survives refresh/cross-tab token updates without manual coordination.
 *
 * Primarily a debug/visibility component; useful in admin dashboards.
 */
export interface TokenExpiryCountdownProps {
    client?: AuthClient;
    className?: string;
    /** Override the format. Receives whole seconds remaining (may be negative). */
    format?: (secondsRemaining: number) => string;
}

function defaultFormat(seconds: number): string {
    if (seconds <= 0) return 'expired';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m >= 60) return `${Math.floor(m / 60)}h ${m % 60}m`;
    if (m >= 1) return `${m}m ${s.toString().padStart(2, '0')}s`;
    return `${s}s`;
}

export function TokenExpiryCountdown(props: TokenExpiryCountdownProps) {
    const snap = useAuth(props.client);
    const exp = snap.claims?.exp ?? null;
    const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));
    useEffect(() => {
        if (snap.status !== 'authenticated') return;
        const id = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
        return () => clearInterval(id);
    }, [snap.status]);
    if (snap.status !== 'authenticated' || !exp) return null;
    const seconds = exp - now;
    const text = (props.format ?? defaultFormat)(seconds);
    return (
        <span class={`vauth-token-countdown ${seconds <= 60 ? 'vauth-warn' : ''} ${props.className ?? ''}`}>
            {text}
        </span>
    );
}
