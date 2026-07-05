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
export declare function TokenExpiryCountdown(props: TokenExpiryCountdownProps): import("preact").JSX.Element | null;
//# sourceMappingURL=TokenExpiryCountdown.d.ts.map