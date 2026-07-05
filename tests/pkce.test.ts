// PKCE tests — round-trip the verifier→challenge derivation and verify
// that the encoded form matches the server's expected wire format.
//
// Run with: pnpm test (delegates to node --test --import tsx).

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import { deriveS256Challenge, generatePKCEPair } from '../src/core/pkce.js';
import { WebCryptoAdapter } from '../src/core/adapters/web-crypto.js';

// Pin globalThis.crypto so the WebCryptoAdapter has a backing implementation
// when run under Node. Browsers and Node ≥17 already expose this; older
// Node setups need the polyfill.
if (typeof globalThis.crypto === 'undefined') {
    Object.defineProperty(globalThis, 'crypto', { value: webcrypto });
}

describe('PKCE', () => {
    it('generatePKCEPair produces a usable verifier + challenge', async () => {
        const crypto = new WebCryptoAdapter();
        const pair = await generatePKCEPair(crypto);
        assert.equal(pair.method, 'S256');
        assert.ok(
            pair.verifier.length >= 43 && pair.verifier.length <= 128,
            'verifier length must be in [43, 128]',
        );
        // Challenge is BASE64URL(SHA256(verifier)) = 43 chars unpadded.
        assert.equal(pair.challenge.length, 43);
        // Round-trip: deriving challenge from the verifier yields the same
        // string (proves we're not putting padding or a different alg
        // through somewhere).
        const re = await deriveS256Challenge(crypto, pair.verifier);
        assert.equal(re, pair.challenge);
    });

    it('verifier alphabet is the RFC 7636 unreserved set', async () => {
        const crypto = new WebCryptoAdapter();
        const allowed = /^[A-Za-z0-9._~-]+$/;
        // Sample a handful of pairs and confirm every char is in the set.
        for (let i = 0; i < 50; i++) {
            const { verifier } = await generatePKCEPair(crypto);
            assert.match(verifier, allowed, `verifier ${verifier} contains a disallowed char`);
        }
    });

    it('challenge is base64url with no padding', async () => {
        const crypto = new WebCryptoAdapter();
        const { challenge } = await generatePKCEPair(crypto);
        // base64url alphabet: A-Z, a-z, 0-9, -, _ — no + / =.
        assert.match(challenge, /^[A-Za-z0-9_-]+$/);
        assert.ok(!challenge.endsWith('='), 'challenge must not be padded');
    });

    it('verifier length parameter is enforced', async () => {
        const crypto = new WebCryptoAdapter();
        await assert.rejects(() => generatePKCEPair(crypto, 42), /43\.\.128/);
        await assert.rejects(() => generatePKCEPair(crypto, 129), /43\.\.128/);
    });

    it('each call returns an independent verifier', async () => {
        const crypto = new WebCryptoAdapter();
        const a = await generatePKCEPair(crypto);
        const b = await generatePKCEPair(crypto);
        // 64 chars × log2(66) bits per char ≈ 387 bits of entropy. A
        // collision in two consecutive calls would be astronomical;
        // checking inequality is a sufficient sanity check.
        assert.notEqual(a.verifier, b.verifier);
        assert.notEqual(a.challenge, b.challenge);
    });
});
