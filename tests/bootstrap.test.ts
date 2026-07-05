// Bootstrap modes + ready() promise + offline guard. Verifies the
// state-machine transitions and the retry-on-401 behavior.

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import { AuthClient } from '../src/core/auth-client.js';
import { OfflineModeError } from '../src/core/errors.js';
import {
    MemoryStorage,
} from '../src/core/adapters/local-storage-storage.js';
import {
    MemoryTokenStore,
} from '../src/core/adapters/local-storage-token-store.js';
import { NoOpLogger } from '../src/core/adapters/loggers.js';
import { NoOpBroadcast } from '../src/core/adapters/broadcast-channel.js';
import { FixedClock } from '../src/core/adapters/system-clock.js';
import { WebCryptoAdapter } from '../src/core/adapters/web-crypto.js';
import type { Transport, TransportRequest, TransportResponse } from '../src/core/types.js';

if (typeof globalThis.crypto === 'undefined') {
    Object.defineProperty(globalThis, 'crypto', { value: webcrypto });
}

/** Mock transport that lets each test wire up canned responses keyed
 * on URL substring. Records every call for assertion. */
class MockTransport implements Transport {
    public calls: TransportRequest[] = [];
    public handlers: Array<(req: TransportRequest) => TransportResponse<unknown> | null> = [];

    setHandler(fn: (req: TransportRequest) => TransportResponse<unknown> | null) {
        this.handlers.push(fn);
    }

    async request<T = unknown>(req: TransportRequest): Promise<TransportResponse<T>> {
        this.calls.push(req);
        for (const h of this.handlers) {
            const resp = h(req);
            if (resp) return resp as TransportResponse<T>;
        }
        return { status: 500, ok: false, body: { error: { code: 'no_handler', message: 'no handler' } } as T, headers: {} };
    }
}

function ports(transport: Transport) {
    return {
        tokenStore: new MemoryTokenStore(),
        transport,
        storage: new MemoryStorage(),
        clock: new FixedClock(1_700_000_000),
        crypto: new WebCryptoAdapter(),
        logger: new NoOpLogger(),
        broadcast: new NoOpBroadcast(),
    };
}

describe('bootstrap modes', () => {
    it('offline mode sets status=offline immediately + refuses flows', async () => {
        const transport = new MockTransport();
        const auth = new AuthClient({
            apiBaseUrl: 'https://auth.example/api/v1',
            bootstrap: 'offline',
            ports: ports(transport),
        });
        await auth.ready();
        assert.equal(auth.getStatus(), 'offline');
        assert.equal(auth.isReady(), true);
        assert.equal(auth.isAuthenticated(), false);
        assert.equal(auth.isOfflineMode(), true);

        // No flow method should make a network call.
        await assert.rejects(
            () => auth.loginWithPassword({ email: 'a@b.com', password: 'x' }),
            OfflineModeError,
        );
        await assert.rejects(() => auth.refreshAccessToken(), OfflineModeError);
        await assert.rejects(() => auth.whoami(), OfflineModeError);
        assert.equal(transport.calls.length, 0, 'offline mode must not issue any HTTP calls');
    });

    it('lazy mode skips proactive validation', async () => {
        const transport = new MockTransport();
        const p = ports(transport);
        // Seed a valid-looking token in the store so the client has cached claims.
        const expiresAt = 1_700_001_000;
        await p.tokenStore.set({
            access_token: makeJwt({ uid: 'u1', email: 'a@b.com', exp: expiresAt }),
            refresh_token: 'r1',
            expires_at_seconds: expiresAt,
        });
        const auth = new AuthClient({
            apiBaseUrl: 'https://auth.example/api/v1',
            bootstrap: 'lazy',
            ports: p,
        });
        await auth.ready();
        assert.equal(auth.getStatus(), 'authenticated');
        assert.equal(transport.calls.length, 0, 'lazy mode must not call /auth/me at boot');
    });

    it('auto mode validates via /auth/me at boot', async () => {
        const transport = new MockTransport();
        const p = ports(transport);
        const expiresAt = 1_700_001_000;
        await p.tokenStore.set({
            access_token: makeJwt({ uid: 'u1', email: 'a@b.com', exp: expiresAt }),
            refresh_token: 'r1',
            expires_at_seconds: expiresAt,
        });
        transport.setHandler((req) => {
            if (req.url.endsWith('/auth/me')) {
                return {
                    status: 200,
                    ok: true,
                    body: { user: { id: 'u1', email: 'a@b.com' } },
                    headers: {},
                };
            }
            return null;
        });
        const auth = new AuthClient({
            apiBaseUrl: 'https://auth.example/api/v1',
            bootstrap: 'auto',
            ports: p,
        });
        await auth.ready();
        assert.equal(auth.getStatus(), 'authenticated');
        assert.ok(
            transport.calls.some((c) => c.url.endsWith('/auth/me')),
            'auto mode must call /auth/me',
        );
    });

    it('auto mode clears state when /auth/me returns 401', async () => {
        const transport = new MockTransport();
        const p = ports(transport);
        const expiresAt = 1_700_001_000;
        await p.tokenStore.set({
            access_token: makeJwt({ uid: 'u1', email: 'a@b.com', exp: expiresAt }),
            refresh_token: 'r1',
            expires_at_seconds: expiresAt,
        });
        transport.setHandler((req) => {
            if (req.url.endsWith('/auth/me')) {
                return {
                    status: 401,
                    ok: false,
                    body: { error: { code: 'unauthenticated', message: 'gone' } },
                    headers: {},
                };
            }
            if (req.url.endsWith('/auth/refresh')) {
                return {
                    status: 401,
                    ok: false,
                    body: { error: { code: 'token_revoked', message: 'revoked' } },
                    headers: {},
                };
            }
            return null;
        });
        const auth = new AuthClient({
            apiBaseUrl: 'https://auth.example/api/v1',
            bootstrap: 'auto',
            ports: p,
        });
        await auth.ready();
        assert.equal(auth.getStatus(), 'anonymous');
        assert.equal(await p.tokenStore.get(), null, 'token store should be cleared');
    });
});

describe('snapshot + subscribe', () => {
    it('emits a snapshot when state changes', async () => {
        const transport = new MockTransport();
        const auth = new AuthClient({
            apiBaseUrl: 'https://auth.example/api/v1',
            bootstrap: 'lazy',
            ports: ports(transport),
        });
        const snaps: string[] = [];
        const off = auth.subscribe((s) => snaps.push(s.status));
        await auth.ready();
        // At minimum one transition: bootstrapping -> anonymous (no token).
        assert.ok(snaps.length >= 1, `expected at least one snapshot, got ${snaps.length}`);
        assert.ok(snaps.includes('anonymous'));
        off();
    });

    it('snapshot identity is stable when unchanged', async () => {
        const transport = new MockTransport();
        const auth = new AuthClient({
            apiBaseUrl: 'https://auth.example/api/v1',
            bootstrap: 'lazy',
            ports: ports(transport),
        });
        await auth.ready();
        const a = auth.getSnapshot();
        const b = auth.getSnapshot();
        assert.equal(a, b, 'consecutive getSnapshot() returns must be reference-equal');
    });
});

/* helpers */

function base64UrlEncode(s: string): string {
    return Buffer.from(s, 'utf-8')
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

function makeJwt(payload: object): string {
    const h = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const p = base64UrlEncode(JSON.stringify(payload));
    return `${h}.${p}.sig`;
}
