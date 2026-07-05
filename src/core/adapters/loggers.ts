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

const PREFIX = '[auth-client]';

export class ConsoleLogger implements Logger {
    private readonly minLevel: number;
    constructor(level: 'debug' | 'info' | 'warn' | 'error' = 'info') {
        this.minLevel = LEVEL[level];
    }
    debug(msg: string, fields?: Record<string, unknown>): void {
        if (this.minLevel <= LEVEL.debug) {
            console.debug(PREFIX, msg, fields ?? '');
        }
    }
    info(msg: string, fields?: Record<string, unknown>): void {
        if (this.minLevel <= LEVEL.info) {
            console.info(PREFIX, msg, fields ?? '');
        }
    }
    warn(msg: string, fields?: Record<string, unknown>): void {
        if (this.minLevel <= LEVEL.warn) {
            console.warn(PREFIX, msg, fields ?? '');
        }
    }
    error(msg: string, fields?: Record<string, unknown>): void {
        if (this.minLevel <= LEVEL.error) {
            console.error(PREFIX, msg, fields ?? '');
        }
    }
}

export class NoOpLogger implements Logger {
    debug(): void {}
    info(): void {}
    warn(): void {}
    error(): void {}
}

const LEVEL: Record<'debug' | 'info' | 'warn' | 'error', number> = {
    debug: 10,
    info: 20,
    warn: 30,
    error: 40,
};
