/**
 * Default Storage port: namespaced localStorage. Used for non-token
 * persistence — PKCE verifiers between /sso/url and /sso/exchange,
 * last-known org id, etc.
 *
 * Same XSS-vs-cookie tradeoff discussion as LocalStorageTokenStore. For
 * non-secret persistence (PKCE verifiers are short-lived and burned-after-
 * use, so they're acceptable in localStorage), the simplicity wins.
 */
import type { Storage } from '../types.js';
export declare class LocalStorageStorage implements Storage {
    private readonly prefix;
    constructor(namespace: string);
    get(key: string): Promise<string | null>;
    set(key: string, value: string): Promise<void>;
    remove(key: string): Promise<void>;
}
/** Memory variant for SSR / tests. */
export declare class MemoryStorage implements Storage {
    private readonly data;
    get(key: string): Promise<string | null>;
    set(key: string, value: string): Promise<void>;
    remove(key: string): Promise<void>;
}
//# sourceMappingURL=local-storage-storage.d.ts.map