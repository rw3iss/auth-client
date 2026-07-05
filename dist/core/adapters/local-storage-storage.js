/**
 * Default Storage port: namespaced localStorage. Used for non-token
 * persistence — PKCE verifiers between /sso/url and /sso/exchange,
 * last-known org id, etc.
 *
 * Same XSS-vs-cookie tradeoff discussion as LocalStorageTokenStore. For
 * non-secret persistence (PKCE verifiers are short-lived and burned-after-
 * use, so they're acceptable in localStorage), the simplicity wins.
 */
export class LocalStorageStorage {
    prefix;
    constructor(namespace) {
        this.prefix = `${namespace}:`;
    }
    async get(key) {
        if (!hasLocalStorage())
            return null;
        return window.localStorage.getItem(this.prefix + key);
    }
    async set(key, value) {
        if (!hasLocalStorage())
            return;
        window.localStorage.setItem(this.prefix + key, value);
    }
    async remove(key) {
        if (!hasLocalStorage())
            return;
        window.localStorage.removeItem(this.prefix + key);
    }
}
/** Memory variant for SSR / tests. */
export class MemoryStorage {
    data = new Map();
    async get(key) {
        return this.data.get(key) ?? null;
    }
    async set(key, value) {
        this.data.set(key, value);
    }
    async remove(key) {
        this.data.delete(key);
    }
}
function hasLocalStorage() {
    try {
        return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
    }
    catch {
        return false;
    }
}
//# sourceMappingURL=local-storage-storage.js.map