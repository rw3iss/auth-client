/**
 * Logger adapters. The default routes to console.info / .warn / .error;
 * production deployments typically swap in a structured logger that
 * funnels into their observability pipeline (Sentry, Datadog, etc.).
 *
 * The two built-ins:
 *   - ConsoleLogger: prints prefixed messages with structured fields.
 *   - NoOpLogger: swallows everything. The right choice when the host
 *     app has its own logging and doesn't want the SDK's chatter.
 */
const PREFIX = '[auth-client]';
export class ConsoleLogger {
    minLevel;
    constructor(level = 'info') {
        this.minLevel = LEVEL[level];
    }
    debug(msg, fields) {
        if (this.minLevel <= LEVEL.debug) {
            console.debug(PREFIX, msg, fields ?? '');
        }
    }
    info(msg, fields) {
        if (this.minLevel <= LEVEL.info) {
            console.info(PREFIX, msg, fields ?? '');
        }
    }
    warn(msg, fields) {
        if (this.minLevel <= LEVEL.warn) {
            console.warn(PREFIX, msg, fields ?? '');
        }
    }
    error(msg, fields) {
        if (this.minLevel <= LEVEL.error) {
            console.error(PREFIX, msg, fields ?? '');
        }
    }
}
export class NoOpLogger {
    debug() { }
    info() { }
    warn() { }
    error() { }
}
const LEVEL = {
    debug: 10,
    info: 20,
    warn: 30,
    error: 40,
};
//# sourceMappingURL=loggers.js.map