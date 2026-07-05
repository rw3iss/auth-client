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
import type { Logger } from '../types.js';
export declare class ConsoleLogger implements Logger {
    private readonly minLevel;
    constructor(level?: 'debug' | 'info' | 'warn' | 'error');
    debug(msg: string, fields?: Record<string, unknown>): void;
    info(msg: string, fields?: Record<string, unknown>): void;
    warn(msg: string, fields?: Record<string, unknown>): void;
    error(msg: string, fields?: Record<string, unknown>): void;
}
export declare class NoOpLogger implements Logger {
    debug(): void;
    info(): void;
    warn(): void;
    error(): void;
}
//# sourceMappingURL=loggers.d.ts.map