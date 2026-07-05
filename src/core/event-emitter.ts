/**
 * Typed event bus used internally by AuthClient.
 *
 * Design choices:
 *
 *   - Discriminated-union event type. Each event carries its `type` plus a
 *     payload specific to that type. Subscribers register against a
 *     literal type string; the handler's argument is narrowed to that
 *     case. This gives autocomplete + type safety without any
 *     decorators/reflection.
 *
 *   - Synchronous dispatch. A subscriber's handler runs on the same
 *     stack as the publisher. Handlers SHOULD NOT throw — the SDK
 *     publishes during state transitions (e.g. inside refresh) and a
 *     throwing subscriber would leave the bus mid-iteration.
 *
 *   - Errors in subscribers are caught + routed through the logger. This
 *     trades "the bus survives a buggy handler" for "the buggy handler
 *     fails silently." Default Logger writes such failures at warn level
 *     so they're visible without crashing the host app.
 *
 *   - No WeakRefs. Subscriptions are stored in a Set; the off() return
 *     value is the canonical way to unsubscribe. This avoids the
 *     "subscriber held by a closure that outlives its container"
 *     surprises that come with WeakRef bookkeeping.
 */

import type {
    AuthEvent,
    AuthEventHandler,
    AuthEventType,
    Logger,
} from './types.js';

export class EventEmitter {
    private readonly listeners: Map<AuthEventType, Set<AuthEventHandler<AuthEventType>>> =
        new Map();
    private readonly logger: Logger;

    constructor(logger: Logger) {
        this.logger = logger;
    }

    /**
     * Subscribe to events of `type`. Returns the unsubscribe function so
     * callers can do `const off = bus.on('authenticated', ...)` and call
     * `off()` later without holding onto the handler reference.
     */
    on<T extends AuthEventType>(type: T, handler: AuthEventHandler<T>): () => void {
        let set = this.listeners.get(type);
        if (!set) {
            set = new Set();
            this.listeners.set(type, set);
        }
        // Cast widens the handler signature to the union — safe because we
        // narrow back when dispatching (we only invoke handlers that were
        // registered against the dispatched type). The double cast via
        // unknown is needed because TS won't let the discriminated-union
        // covariance check pass directly.
        const widened = handler as unknown as AuthEventHandler<AuthEventType>;
        set.add(widened);
        return () => {
            const current = this.listeners.get(type);
            if (current) current.delete(widened);
        };
    }

    /** Manual unsubscribe — usually unnecessary since on() returns one. */
    off<T extends AuthEventType>(type: T, handler: AuthEventHandler<T>): void {
        const set = this.listeners.get(type);
        if (set) set.delete(handler as unknown as AuthEventHandler<AuthEventType>);
    }

    /**
     * Dispatch an event to every subscriber for its type. Synchronous.
     * Subscriber errors are caught + logged at warn level — they never
     * propagate out of emit().
     */
    emit(event: AuthEvent): void {
        const set = this.listeners.get(event.type);
        if (!set || set.size === 0) return;
        // Snapshot the set so a handler that unsubscribes mid-dispatch
        // doesn't perturb the iteration order.
        const handlers = Array.from(set);
        for (const handler of handlers) {
            try {
                // The widening at registration time is reversed here: each
                // handler was registered against `event.type`, so passing
                // event matches the narrowed signature.
                (handler as (e: AuthEvent) => void)(event);
            } catch (err) {
                this.logger.warn('event handler threw', {
                    event_type: event.type,
                    error: errorMessage(err),
                });
            }
        }
    }

    /** Removes all subscribers. Called on AuthClient.destroy(). */
    clear(): void {
        this.listeners.clear();
    }
}

function errorMessage(err: unknown): string {
    if (err instanceof Error) return err.message;
    return String(err);
}
