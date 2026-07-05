/**
 * SystemClock — Date.now() / 1000 wrapped to satisfy the Clock port.
 *
 * The port exists so tests can pin the clock (essential for verifying the
 * "preemptive refresh fires at exp - leeway" logic without sleeping
 * through the actual TTL). In production this is a one-line wrapper.
 */
import type { Clock } from '../types.js';
export declare class SystemClock implements Clock {
    nowSeconds(): number;
}
/** FixedClock — for tests. Reports a stable value until advance() is called. */
export declare class FixedClock implements Clock {
    private current;
    constructor(current: number);
    nowSeconds(): number;
    advance(seconds: number): void;
    set(seconds: number): void;
}
//# sourceMappingURL=system-clock.d.ts.map