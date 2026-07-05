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
const ACTIVITY_EVENTS = [
    'pointerdown', 'mousemove', 'keydown', 'touchstart', 'scroll', 'focus',
];
export class IdleTracker {
    opts;
    lastActivityMs;
    lastWriteMs = 0;
    checkTimer = null;
    boundOnActivity = () => this.recordActivity();
    boundOnVisibility = () => {
        if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
            this.recordActivity();
        }
    };
    started = false;
    firedIdle = false;
    constructor(opts) {
        this.opts = {
            throttleMs: 1000,
            ...opts,
        };
        this.lastActivityMs = Date.now();
    }
    /** Begin listening + the idle check interval. Idempotent. */
    start() {
        if (this.started)
            return;
        if (typeof window === 'undefined' || typeof document === 'undefined')
            return;
        this.started = true;
        this.lastActivityMs = Date.now();
        this.firedIdle = false;
        for (const ev of ACTIVITY_EVENTS) {
            window.addEventListener(ev, this.boundOnActivity, { passive: true, capture: true });
        }
        document.addEventListener('visibilitychange', this.boundOnVisibility);
        // Coarse check interval — quarter of the idle window, capped
        // at 60s. The granularity isn't important; we just need to
        // notice "crossed the threshold" within a reasonable time.
        const intervalMs = Math.min(60000, Math.max(5000, Math.floor(this.opts.idleTimeoutMs / 4)));
        this.checkTimer = setInterval(() => this.tick(), intervalMs);
    }
    /** Stop listening + clear the check interval. Idempotent. */
    stop() {
        if (!this.started)
            return;
        this.started = false;
        for (const ev of ACTIVITY_EVENTS) {
            try {
                window.removeEventListener(ev, this.boundOnActivity, { capture: true });
            }
            catch { /* ignore */ }
        }
        try {
            document.removeEventListener('visibilitychange', this.boundOnVisibility);
        }
        catch { /* ignore */ }
        if (this.checkTimer !== null) {
            clearInterval(this.checkTimer);
            this.checkTimer = null;
        }
    }
    /** Whether the user is currently considered idle. Cheap to call. */
    isIdle() {
        return Date.now() - this.lastActivityMs > this.opts.idleTimeoutMs;
    }
    /** Milliseconds since the last observed activity event. */
    msSinceActivity() {
        return Date.now() - this.lastActivityMs;
    }
    recordActivity() {
        const now = Date.now();
        if (now - this.lastWriteMs < this.opts.throttleMs)
            return;
        this.lastWriteMs = now;
        this.lastActivityMs = now;
        // Crossing from idle back to active rearms the one-shot fire.
        this.firedIdle = false;
    }
    tick() {
        if (this.firedIdle)
            return;
        if (this.isIdle()) {
            this.firedIdle = true;
            try {
                this.opts.onIdle();
            }
            catch {
                // Swallow callback errors — the consumer's onIdle
                // handler is expected to be a fire-and-forget
                // "clear local state" call.
            }
        }
    }
}
//# sourceMappingURL=idle-tracker.js.map