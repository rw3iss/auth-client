/**
 * Coalesce concurrent refresh attempts.
 *
 * Without this, a UI that fires N requests just-in-time of access-token
 * expiry would issue N refresh calls — each one rotating the chain, each
 * one invalidating its predecessors. On the auth-server side, that's the
 * "refresh-token reuse" signal which trips family-revoke (AUDIT 1.9):
 * every concurrent caller after the first sees their request fail AND
 * kills the session.
 *
 * The mutex pattern:
 *
 *   - First caller invokes the underlying refresh function and stashes
 *     the in-flight promise.
 *   - Every subsequent caller during the window awaits the same promise
 *     — they get the same new token pair, no second network call.
 *   - When the promise resolves (success or failure), the slot clears so
 *     the NEXT refresh window starts fresh.
 *
 * Cross-tab: this only coalesces within ONE tab. The cross-tab story is
 * handled separately via BroadcastChannel — when tab A refreshes, it
 * broadcasts the new tokens so tab B picks them up without doing its own
 * refresh. The mutex still helps inside each tab for the just-in-time
 * burst.
 */
export class RefreshMutex {
    inFlight = null;
    /**
     * If a refresh is already in flight, returns the same promise.
     * Otherwise invokes `op` and stashes its promise until it settles.
     *
     * Failures clear the slot so the next call starts a fresh attempt.
     * Success clears the slot so the NEXT-after-success call starts
     * fresh too — we don't cache successful results across calls (the
     * caller persists the new tokens; the mutex is purely about
     * deduplication of concurrent attempts).
     */
    run(op) {
        if (this.inFlight) {
            return this.inFlight;
        }
        const promise = op().finally(() => {
            // Clear if we're still the in-flight slot (guard against a
            // pathological op() that synchronously triggered another
            // call which would have overwritten the slot).
            if (this.inFlight === promise) {
                this.inFlight = null;
            }
        });
        this.inFlight = promise;
        return promise;
    }
    /** Used by tests. Returns the current in-flight promise or null. */
    pending() {
        return this.inFlight;
    }
}
//# sourceMappingURL=refresh-mutex.js.map