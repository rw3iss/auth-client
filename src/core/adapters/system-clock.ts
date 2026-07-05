/**
 * SystemClock — Date.now() / 1000 wrapped to satisfy the Clock port.
 *
 * The port exists so tests can pin the clock (essential for verifying the
 * "preemptive refresh fires at exp - leeway" logic without sleeping
 * through the actual TTL). In production this is a one-line wrapper.
 */

import type { Clock } from '../types.js';

export class SystemClock implements Clock {
    nowSeconds(): number {
        return Math.floor(Date.now() / 1000);
    }
}

/** FixedClock — for tests. Reports a stable value until advance() is called. */
export class FixedClock implements Clock {
    constructor(private current: number) {}
    nowSeconds(): number {
        return this.current;
    }
    advance(seconds: number): void {
        this.current += seconds;
    }
    set(seconds: number): void {
        this.current = seconds;
    }
}
