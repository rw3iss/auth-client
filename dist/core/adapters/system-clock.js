/**
 * SystemClock — Date.now() / 1000 wrapped to satisfy the Clock port.
 *
 * The port exists so tests can pin the clock (essential for verifying the
 * "preemptive refresh fires at exp - leeway" logic without sleeping
 * through the actual TTL). In production this is a one-line wrapper.
 */
export class SystemClock {
    nowSeconds() {
        return Math.floor(Date.now() / 1000);
    }
}
/** FixedClock — for tests. Reports a stable value until advance() is called. */
export class FixedClock {
    current;
    constructor(current) {
        this.current = current;
    }
    nowSeconds() {
        return this.current;
    }
    advance(seconds) {
        this.current += seconds;
    }
    set(seconds) {
        this.current = seconds;
    }
}
//# sourceMappingURL=system-clock.js.map