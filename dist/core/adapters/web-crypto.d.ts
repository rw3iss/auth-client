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
import type { Crypto } from '../types.js';
export declare class WebCryptoAdapter implements Crypto {
    randomBytes(length: number): Uint8Array;
    sha256(input: Uint8Array): Promise<Uint8Array>;
}
//# sourceMappingURL=web-crypto.d.ts.map