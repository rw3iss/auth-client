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

export class LocalStorageStorage implements Storage {
    private readonly prefix: string;

    constructor(namespace: string) {
        this.prefix = `${namespace}:`;
    }

    async get(key: string): Promise<string | null> {
        if (!hasLocalStorage()) return null;
        return window.localStorage.getItem(this.prefix + key);
    }

    async set(key: string, value: string): Promise<void> {
        if (!hasLocalStorage()) return;
        window.localStorage.setItem(this.prefix + key, value);
    }

    async remove(key: string): Promise<void> {
        if (!hasLocalStorage()) return;
        window.localStorage.removeItem(this.prefix + key);
    }
}

/** Memory variant for SSR / tests. */
export class MemoryStorage implements Storage {
    private readonly data = new Map<string, string>();
    async get(key: string): Promise<string | null> {
        return this.data.get(key) ?? null;
    }
    async set(key: string, value: string): Promise<void> {
        this.data.set(key, value);
    }
    async remove(key: string): Promise<void> {
        this.data.delete(key);
    }
}

function hasLocalStorage(): boolean {
    try {
        return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
    } catch {
        return false;
    }
}
