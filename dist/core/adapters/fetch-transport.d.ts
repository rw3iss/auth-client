/**
 * Default Transport: thin wrapper around the platform `fetch`. Adds:
 *
 *   - JSON content-type negotiation (Content-Type + Accept).
 *   - Optional Authorization-bearer header when the SDK has a token,
 *     unless the request opts out via skipAuth.
 *   - Body serialization (objects → JSON; FormData / Blob pass-through).
 *   - Response shape normalization into TransportResponse.
 *
 * No retry, no circuit breaking, no observability — those are layered
 * concerns better handled in a wrapping transport when the consumer
 * needs them. This default keeps the SDK byte-footprint small.
 *
 * `tokenProvider` is a function rather than a stored value because the
 * transport is constructed before the AuthClient finishes wiring; an
 * async getter avoids the boot-order coupling.
 */
import type { Transport, TransportRequest, TransportResponse } from '../types.js';
export interface FetchTransportOptions {
    /** Returns the current access token, or null if not authenticated. */
    tokenProvider: () => Promise<string | null>;
    /** When false, Authorization header is never attached regardless of
     * skipAuth — useful when the host app uses cookies for auth and
     * doesn't want a duplicate Bearer header confusing the server. */
    attachAuthHeader: boolean;
    /** Optional custom fetch — used by SSR (node-fetch) and tests. */
    fetchImpl?: typeof globalThis.fetch;
    /**
     * Retry configuration for transient failures (network errors + 5xx).
     * 4xx responses are NEVER retried — those are user errors and a retry
     * would just hide the misconfiguration. Pass `{ maxAttempts: 1 }` to
     * disable retries entirely. Default: 3 attempts with exponential
     * backoff (200ms, 500ms) + 0–50ms jitter.
     */
    retry?: RetryOptions;
}
export interface RetryOptions {
    /** Total attempts including the first call. Default 3. */
    maxAttempts?: number;
    /** Base delay between attempts in ms. Default 200. */
    baseDelayMs?: number;
    /** Cap on individual attempt delay. Default 2000. */
    maxDelayMs?: number;
    /** Add up to this many ms of random jitter per attempt. Default 50. */
    jitterMs?: number;
}
export declare class FetchTransport implements Transport {
    private readonly tokenProvider;
    private readonly attachAuthHeader;
    private readonly fetchImpl;
    private readonly retry;
    constructor(opts: FetchTransportOptions);
    request<T = unknown>(req: TransportRequest): Promise<TransportResponse<T>>;
    /** Exponential backoff: baseDelay * 2^(attempt-1), capped, plus jitter. */
    private delayForAttempt;
}
//# sourceMappingURL=fetch-transport.d.ts.map