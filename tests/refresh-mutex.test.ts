// RefreshMutex — verifies that concurrent run() calls coalesce into a
// single underlying op. Critical: without coalescing, the auth-server's
// refresh-token rotation would trip the family-revoke detector on the
// second concurrent caller.

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { RefreshMutex } from '../src/core/refresh-mutex.js';

describe('RefreshMutex', () => {
    it('coalesces concurrent calls into one underlying op', async () => {
        const mutex = new RefreshMutex<string>();
        let calls = 0;
        const op = () =>
            new Promise<string>((resolve) => {
                calls++;
                setTimeout(() => resolve('result'), 10);
            });
        // Fire ten concurrent calls. Without coalescing, op() would run
        // ten times.
        const results = await Promise.all(
            Array.from({ length: 10 }, () => mutex.run(op)),
        );
        assert.equal(calls, 1, 'op must run exactly once for ten concurrent callers');
        for (const r of results) {
            assert.equal(r, 'result');
        }
    });

    it('clears the slot after success so subsequent calls start fresh', async () => {
        const mutex = new RefreshMutex<number>();
        let calls = 0;
        const op = () => Promise.resolve(++calls);
        const a = await mutex.run(op);
        const b = await mutex.run(op);
        assert.equal(a, 1);
        assert.equal(b, 2, 'second call should re-invoke op, not return cached value');
    });

    it('clears the slot after failure', async () => {
        const mutex = new RefreshMutex<number>();
        let calls = 0;
        const op = (): Promise<number> => {
            calls++;
            if (calls === 1) return Promise.reject(new Error('first call fails'));
            return Promise.resolve(42);
        };
        await assert.rejects(() => mutex.run(op), /first call fails/);
        const ok = await mutex.run(op);
        assert.equal(ok, 42);
        assert.equal(calls, 2);
    });

    it('exposes the in-flight promise via pending()', async () => {
        const mutex = new RefreshMutex<string>();
        const promise = mutex.run(
            () => new Promise<string>((resolve) => setTimeout(() => resolve('x'), 5)),
        );
        assert.equal(mutex.pending(), promise);
        await promise;
        assert.equal(mutex.pending(), null);
    });
});
