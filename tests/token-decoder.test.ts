// JWT decoder — verifies we round-trip valid tokens and reject malformed
// ones cleanly. The decoder never validates signatures (the server does);
// these tests only cover structural correctness.

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
    decodeAccessToken,
    InvalidTokenError,
    secondsUntilExpiry,
    tryDecodeAccessToken,
} from '../src/core/token-decoder.js';

function base64UrlEncode(s: string): string {
    return Buffer.from(s, 'utf-8')
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

function makeToken(payload: object, header: object = { alg: 'HS256', typ: 'JWT' }): string {
    const h = base64UrlEncode(JSON.stringify(header));
    const p = base64UrlEncode(JSON.stringify(payload));
    // Signature segment can be anything — we don't validate it.
    return `${h}.${p}.signature`;
}

describe('decodeAccessToken', () => {
    it('decodes a well-formed token', () => {
        const token = makeToken({
            sub: 'user-1',
            uid: 'user-1',
            email: 'a@b.com',
            exp: 9_999_999_999,
            iat: 1_700_000_000,
            roles: ['buyer'],
        });
        const decoded = decodeAccessToken(token);
        assert.equal(decoded.uid, 'user-1');
        assert.equal(decoded.email, 'a@b.com');
        assert.deepEqual(decoded.roles, ['buyer']);
    });

    it('rejects alg=none', () => {
        const token = makeToken({ exp: 1 }, { alg: 'none' });
        assert.throws(() => decodeAccessToken(token), InvalidTokenError);
    });

    it('rejects malformed three-segment tokens', () => {
        assert.throws(() => decodeAccessToken('not.a.token'), InvalidTokenError);
        assert.throws(() => decodeAccessToken('only.two'), InvalidTokenError);
        assert.throws(() => decodeAccessToken(''), InvalidTokenError);
    });

    it('tryDecodeAccessToken swallows errors', () => {
        assert.equal(tryDecodeAccessToken('not.a.token'), null);
    });

    it('secondsUntilExpiry returns negative when expired', () => {
        const token = makeToken({ exp: 1000, sub: 'u' });
        const decoded = decodeAccessToken(token);
        assert.equal(secondsUntilExpiry(decoded, 2000), -1000);
    });

    it('preserves imp_uid stamps for impersonation detection', () => {
        const token = makeToken({
            uid: 'target-id',
            email: 'target@example.com',
            imp_uid: 'admin-id',
            imp_email: 'admin@example.com',
            exp: 9_999_999_999,
        });
        const decoded = decodeAccessToken(token);
        assert.equal(decoded.imp_uid, 'admin-id');
        assert.equal(decoded.imp_email, 'admin@example.com');
    });

    it('decodes multibyte UTF-8 in display fields', () => {
        const token = makeToken({
            uid: '1',
            email: 'a@b.com',
            display_name: 'José Ümlaut 🚀',
            exp: 1,
        });
        const decoded = decodeAccessToken(token);
        assert.equal(decoded.display_name, 'José Ümlaut 🚀');
    });
});
