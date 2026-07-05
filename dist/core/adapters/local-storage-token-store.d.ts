/**
 * Default TokenStore: localStorage with a namespaced key.
 *
 * Why localStorage and not sessionStorage / cookies?
 *
 *   - sessionStorage: scoped to one tab. We want cross-tab sync (multiple
 *     tabs of the same app sharing the session), which sessionStorage
 *     doesn't support.
 *   - cookies (Secure, HttpOnly): the safest option in principle — JS
 *     can't read the token, so an XSS payload can't exfiltrate it.
 *     BUT: HttpOnly cookies require the server to set them, the SDK
 *     can't read them at all, and refresh-rotation needs JS read access
 *     (we send the refresh token in a request body). HttpOnly cookies
 *     work for the access token alone (server attaches; SDK never sees
 *     it) but split tokens between two storage mechanisms.
 *   - localStorage: readable + writable from JS, persistent across tabs
 *     and reloads, simple. XSS is the threat model — but if your app
 *     has XSS, the attacker can hit any in-process auth header anyway.
 *
 * For the marketplace use case (first-party auth on a known origin), the
 * tradeoff lands on localStorage with CSP + COOP/COEP + sanitized inputs
 * as the XSS mitigation strategy.
 *
 * Operators who want HttpOnly cookies can swap in a custom TokenStore;
 * the SDK's port architecture is designed for exactly that.
 */
import type { StoredTokens, TokenStore } from '../types.js';
export declare class LocalStorageTokenStore implements TokenStore {
    private readonly key;
    constructor(namespace: string);
    get(): Promise<StoredTokens | null>;
    set(tokens: StoredTokens): Promise<void>;
    clear(): Promise<void>;
}
/**
 * MemoryTokenStore — non-persistent backing for SSR / tests. Useful when
 * the SDK is instantiated in a Node context (server-rendered initial
 * paint) where touching localStorage would throw.
 */
export declare class MemoryTokenStore implements TokenStore {
    private tokens;
    get(): Promise<StoredTokens | null>;
    set(tokens: StoredTokens): Promise<void>;
    clear(): Promise<void>;
}
//# sourceMappingURL=local-storage-token-store.d.ts.map