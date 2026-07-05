/**
 * Default Crypto port: WebCrypto. Available in every modern browser and
 * in Node ≥17 via `globalThis.crypto`.
 *
 * SSR / older Node — pass a custom Crypto in config.ports.crypto. The
 * interface is two methods so a polyfill is trivial:
 *
 *   {
 *     randomBytes(n) { return crypto.randomFillSync(new Uint8Array(n)); },
 *     sha256: async (bytes) => new Uint8Array(createHash('sha256').update(bytes).digest()),
 *   }
 */
export class WebCryptoAdapter {
    randomBytes(length) {
        const out = new Uint8Array(length);
        if (typeof globalThis.crypto?.getRandomValues !== 'function') {
            throw new Error('WebCrypto getRandomValues is not available; supply a custom Crypto port');
        }
        globalThis.crypto.getRandomValues(out);
        return out;
    }
    async sha256(input) {
        if (typeof globalThis.crypto?.subtle?.digest !== 'function') {
            throw new Error('WebCrypto subtle.digest is not available; supply a custom Crypto port');
        }
        // SubtleCrypto.digest returns ArrayBuffer; wrap as Uint8Array.
        // input.buffer can be a SharedArrayBuffer view; copy into a fresh
        // ArrayBuffer so the digest call gets the right backing type.
        const copy = new Uint8Array(input.length);
        copy.set(input);
        const digest = await globalThis.crypto.subtle.digest('SHA-256', copy);
        return new Uint8Array(digest);
    }
}
//# sourceMappingURL=web-crypto.js.map