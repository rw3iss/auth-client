/**
 * IdleTracker — DOM-driven activity sensor for app-side idle policy.
 *
 * Some products want "auto-sign-out after N minutes of inactivity"
 * semantics even when the refresh token's natural TTL is much longer
 * (7d / 30d remember-me). The cheapest implementation is client-side:
 * listen to the events that signal a real human at the keyboard, and
 * trip a callback once we've gone `idleTimeoutMs` without any of them
 * firing.
 *
 * Tracked events: pointerdown, mousemove, keydown, touchstart,
 * scroll, focus, visibilitychange (when becoming visible). These
 * cover desktop, touch, and tab-switch wake-ups. Throttled so a
 * single mouse jiggle doesn't spam writes — we only record activity
 * at most once per `throttleMs` (default 1000).
 *
 * The class is browser-only. Calling `start()` outside a browser
 * (no `document`/`window`) is a no-op — safe to import in SSR
 * builds, but it won't do anything until hydrated.
 *
 * AuthClient instantiates this only when `idleTimeoutMs` is set on
 * the config; otherwise activity tracking has zero cost.
 */
export interface IdleTrackerOptions {
    /** Inactivity threshold in ms. When `now - lastActivity > idleTimeoutMs`,
     *  the onIdle callback fires. */
    idleTimeoutMs: number;
    /** Minimum interval (ms) between activity writes — prevents tight
     *  mousemove loops from doing real work on every event. Default 1000. */
    throttleMs?: number;
    /** Fired when the tracker observes the user crossing from active
     *  to idle (`now - lastActivity > idleTimeoutMs` at check time).
     *  The check runs on a coarse interval (1/4 of `idleTimeoutMs`,
     *  capped at 60s) so the fire is best-effort, not instant. */
    onIdle: () => void;
}
export declare class IdleTracker {
    private readonly opts;
    private lastActivityMs;
    private lastWriteMs;
    private checkTimer;
    private boundOnActivity;
    private boundOnVisibility;
    private started;
    private firedIdle;
    constructor(opts: IdleTrackerOptions);
    /** Begin listening + the idle check interval. Idempotent. */
    start(): void;
    /** Stop listening + clear the check interval. Idempotent. */
    stop(): void;
    /** Whether the user is currently considered idle. Cheap to call. */
    isIdle(): boolean;
    /** Milliseconds since the last observed activity event. */
    msSinceActivity(): number;
    private recordActivity;
    private tick;
}
//# sourceMappingURL=idle-tracker.d.ts.map