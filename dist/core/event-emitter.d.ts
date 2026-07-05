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
import type { AuthEvent, AuthEventHandler, AuthEventType, Logger } from './types.js';
export declare class EventEmitter {
    private readonly listeners;
    private readonly logger;
    constructor(logger: Logger);
    /**
     * Subscribe to events of `type`. Returns the unsubscribe function so
     * callers can do `const off = bus.on('authenticated', ...)` and call
     * `off()` later without holding onto the handler reference.
     */
    on<T extends AuthEventType>(type: T, handler: AuthEventHandler<T>): () => void;
    /** Manual unsubscribe — usually unnecessary since on() returns one. */
    off<T extends AuthEventType>(type: T, handler: AuthEventHandler<T>): void;
    /**
     * Dispatch an event to every subscriber for its type. Synchronous.
     * Subscriber errors are caught + logged at warn level — they never
     * propagate out of emit().
     */
    emit(event: AuthEvent): void;
    /** Removes all subscribers. Called on AuthClient.destroy(). */
    clear(): void;
}
//# sourceMappingURL=event-emitter.d.ts.map