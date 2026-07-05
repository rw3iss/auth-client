/**
 * Astro server-side auth helper.
 *
 * Astro is SSR/SSG: `.astro` files run their front-matter scripts at
 * request time, before the client island hydrates. This helper gives
 * those scripts a way to:
 *
 *   1. Read the user's access token from a cookie (cookie auth is the
 *      sensible default on the server; localStorage isn't accessible
 *      there).
 *   2. Optionally validate the token against auth-server's /auth/me.
 *   3. Surface user + claims so server-rendered pages can branch on
 *      authentication state (e.g., redirect to /login server-side).
 *
 * The shape is INTENTIONALLY different from the client-side AuthClient:
 *   - Stateless. One call per request. No subscriptions, no events.
 *   - Cookie-first. Browser AuthClient is localStorage-first.
 *   - Read-only. The server helper doesn't mint or rotate tokens —
 *     that's a client-side concern. (If you want server-side login,
 *     handle the /auth/login POST in an Astro API route and Set-Cookie
 *     the result.)
 *
 * Client islands inside `.astro` pages get full AuthClient behavior by
 * mounting a `<AuthProvider client={...}>` from the matching framework
 * adapter (react / preact / solid / vue).
 */
import type { DecodedAccessToken, User } from '../../core/types.js';
export interface ServerAuthConfig {
    /** Auth-server base URL, e.g. "https://auth.ryanweiss.net/api/v1". */
    apiBaseUrl: string;
    /** Cookie name carrying the access token. Default: 'rw3iss_access_token'. */
    cookieName?: string;
    /** When true, the helper hits /auth/me to confirm server-side
     * validity. Adds a network roundtrip per request; recommended for
     * pages that gate sensitive content. Default: false (decode only). */
    validateOnServer?: boolean;
    /** Custom fetch — Astro Cloudflare / Deno / Node adapters expose
     * different globals. Default: globalThis.fetch. */
    fetchImpl?: typeof globalThis.fetch;
}
export interface ServerAuthResult {
    /** True when a valid access token was found (decoded + optionally
     * server-validated). */
    isAuthenticated: boolean;
    /** Decoded JWT claims, or null. */
    claims: DecodedAccessToken | null;
    /** User snapshot from /auth/me (only when validateOnServer is true
     * AND the request succeeded), or null. */
    user: User | null;
    /** Any error encountered during validation. */
    error: Error | null;
}
/**
 * Astro server-side helper. Call from a `.astro` page's front-matter:
 *
 *   ---
 *   import { getServerAuth } from '@rw3iss/auth-client/astro';
 *   const auth = await getServerAuth(Astro.request, {
 *     apiBaseUrl: import.meta.env.AUTH_API_URL,
 *     validateOnServer: true,
 *   });
 *   if (!auth.isAuthenticated) return Astro.redirect('/login');
 *   ---
 *
 *   <h1>Welcome, {auth.user?.email}</h1>
 *
 * The `request` argument is whatever Astro's adapter calls it — `Astro.request`
 * in `.astro` files, or `APIContext.request` in API routes.
 */
export declare function getServerAuth(request: Request, config: ServerAuthConfig): Promise<ServerAuthResult>;
//# sourceMappingURL=server.d.ts.map