/**
 * RefreshScheduler — fires a callback shortly before the access token
 * expires, so an actively-used app re-mints its access token in the
 * background without ever flipping to status='anonymous'.
 *
 * Why this exists. The auth-server issues short-lived access tokens
 * (15-minute TTL by default). Without proactive refresh, the SDK
 * relies on either a request to fail 401 (autoRetryOn401 path) or
 * the next `getAccessToken()` call to find the cached token near-
 * expiry and refresh on demand. Both work, but the snapshot's
 * `status` flips to 'anonymous' the moment the cached claims pass
 * exp, because `recomputeStatus()` checks claim freshness. The app
 * UI then briefly thinks the user is logged out even though we hold
 * a valid refresh token.
 *
 * The scheduler fixes that by re-minting in the background ~60s
 * before exp. On success, the new claims arrive, `recomputeStatus()`
 * stays at 'authenticated', and the user sees no interruption.
 *
 * Bounds. setTimeout delays are clamped to `[minDelayMs, maxDelayMs]`:
 *   - The lower bound (default 1s) keeps an already-expired token
 *     from spinning into a refresh storm — if the server is down
 *     and refresh keeps failing, we still wait at least a second
 *     between retries.
 *   - The upper bound (default 6 hours) caps setTimeout values for
 *     remember-me sessions where the refresh-token TTL is 30 days —
 *     browser engines mishandle very large timer values, and tabs
 *     get suspended anyway long before that.
 *
 * SSR / non-browser. The class itself has no DOM dependency. The
 * `setTimeout` global is available in Node 12+, so this works in
 * SSR too. AuthClient gates instantiation on `autoRefresh: true`,
 * default true.
 */
export interface RefreshSchedulerOptions {
    /** Seconds before token exp at which to fire. Default 60. */
    leewaySeconds?: number;
    /** Minimum delay clamp (ms). Default 1000. */
    minDelayMs?: number;
    /** Maximum delay clamp (ms). Default 6 hours. */
    maxDelayMs?: number;
}
interface Clock {
    nowSeconds(): number;
}
export declare class RefreshScheduler {
    private readonly clock;
    private timer;
    private readonly opts;
    constructor(clock: Clock, opts?: RefreshSchedulerOptions);
    /**
     * Schedule a refresh to fire `leewaySeconds` before the token
     * expires. Replaces any previous schedule — every persistTokens()
     * call should call this so context-switch refreshes (org/app
     * change → new exp) re-anchor the timer.
     */
    schedule(expiresAtSeconds: number, callback: () => void): void;
    /** Cancel a pending refresh. Idempotent. */
    cancel(): void;
}
export {};
//# sourceMappingURL=refresh-scheduler.d.ts.map