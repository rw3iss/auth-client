// EventEmitter — typed dispatch, isolation between event types, and the
// "handler error doesn't break the bus" invariant.

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from '../src/core/event-emitter.js';
import { NoOpLogger } from '../src/core/adapters/loggers.js';
import type { Logger } from '../src/core/types.js';

describe('EventEmitter', () => {
    it('dispatches to subscribers of the matching type only', () => {
        const bus = new EventEmitter(new NoOpLogger());
        const authReceived: string[] = [];
        const logoutReceived: string[] = [];
        bus.on('logged_out', (e) => logoutReceived.push(e.reason));
        bus.on('token_refreshed', (e) => {
            // Distinct payload shape: prove type narrowing works.
            authReceived.push(e.tokens.access_token);
        });

        bus.emit({ type: 'logged_out', reason: 'user_initiated' });
        bus.emit({
            type: 'token_refreshed',
            tokens: {
                access_token: 'a',
                refresh_token: 'r',
                token_type: 'Bearer',
                expires_in: 900,
                expires_at: '2030-01-01T00:00:00Z',
            },
        });

        assert.deepEqual(logoutReceived, ['user_initiated']);
        assert.deepEqual(authReceived, ['a']);
    });

    it('unsubscribe via the returned function removes the handler', () => {
        const bus = new EventEmitter(new NoOpLogger());
        let count = 0;
        const off = bus.on('logged_out', () => count++);
        bus.emit({ type: 'logged_out', reason: 'user_initiated' });
        off();
        bus.emit({ type: 'logged_out', reason: 'user_initiated' });
        assert.equal(count, 1);
    });

    it('a throwing handler does not stop other handlers', () => {
        // Capture logger warns to confirm we routed the failure through.
        const warns: string[] = [];
        const logger: Logger = {
            debug: () => {},
            info: () => {},
            warn: (msg) => warns.push(msg),
            error: () => {},
        };
        const bus = new EventEmitter(logger);
        let secondRan = false;
        bus.on('logged_out', () => {
            throw new Error('handler bug');
        });
        bus.on('logged_out', () => {
            secondRan = true;
        });
        bus.emit({ type: 'logged_out', reason: 'user_initiated' });
        assert.ok(secondRan, 'subsequent handlers must still run');
        assert.equal(warns.length, 1);
    });

    it('clear removes every subscriber', () => {
        const bus = new EventEmitter(new NoOpLogger());
        let count = 0;
        bus.on('logged_out', () => count++);
        bus.clear();
        bus.emit({ type: 'logged_out', reason: 'user_initiated' });
        assert.equal(count, 0);
    });
});
