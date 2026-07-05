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
const DEFAULT_RETRY = {
    maxAttempts: 3,
    baseDelayMs: 200,
    maxDelayMs: 2000,
    jitterMs: 50,
};
export class FetchTransport {
    tokenProvider;
    attachAuthHeader;
    fetchImpl;
    retry;
    constructor(opts) {
        this.tokenProvider = opts.tokenProvider;
        this.attachAuthHeader = opts.attachAuthHeader;
        this.fetchImpl = opts.fetchImpl ?? globalThis.fetch.bind(globalThis);
        this.retry = { ...DEFAULT_RETRY, ...(opts.retry ?? {}) };
    }
    async request(req) {
        const headers = {
            Accept: 'application/json',
            ...(req.headers ?? {}),
        };
        // Content-Type only for bodies we serialize. FormData / Blob would
        // get the wrong header if we forced JSON.
        const body = serializeBody(req.body, headers);
        // Auth header. Attached when:
        //   - the consumer hasn't disabled it via config
        //   - this specific request didn't opt out (skipAuth)
        //   - a token actually exists
        if (this.attachAuthHeader && !req.skipAuth) {
            const token = await this.tokenProvider();
            if (token && !headers['Authorization']) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }
        const init = {
            method: req.method,
            headers,
        };
        if (body !== undefined) {
            init.body = body;
        }
        if (req.signal) {
            init.signal = req.signal;
        }
        // Retry on network errors + 5xx. 4xx is a stable user error
        // and is returned immediately without retry — silent backoff
        // would just delay the obvious "bad request" surfacing.
        // Caller can opt out of retries on a per-request basis via
        // `req.signal` (abort) or by setting `retry.maxAttempts: 1` at
        // construction time.
        let lastErr = null;
        for (let attempt = 1; attempt <= this.retry.maxAttempts; attempt++) {
            try {
                const response = await this.fetchImpl(req.url, init);
                if (response.status >= 500 && attempt < this.retry.maxAttempts) {
                    await this.delayForAttempt(attempt, req.signal);
                    continue;
                }
                const responseBody = await parseResponseBody(response);
                return {
                    status: response.status,
                    ok: response.ok,
                    body: responseBody,
                    headers: extractHeaders(response.headers),
                };
            }
            catch (err) {
                lastErr = err;
                // AbortError from req.signal — never retry, the caller
                // explicitly cancelled.
                if (err?.name === 'AbortError')
                    throw err;
                if (attempt >= this.retry.maxAttempts)
                    throw err;
                await this.delayForAttempt(attempt, req.signal);
            }
        }
        // Unreachable in practice; the for-loop either returns or throws.
        throw lastErr ?? new Error('fetch transport: exhausted retries');
    }
    /** Exponential backoff: baseDelay * 2^(attempt-1), capped, plus jitter. */
    delayForAttempt(attempt, signal) {
        const exp = this.retry.baseDelayMs * Math.pow(2, attempt - 1);
        const capped = Math.min(exp, this.retry.maxDelayMs);
        const jitter = Math.random() * this.retry.jitterMs;
        const ms = capped + jitter;
        return new Promise((resolve, reject) => {
            const t = setTimeout(() => resolve(), ms);
            if (signal) {
                const onAbort = () => {
                    clearTimeout(t);
                    reject(new DOMException('aborted', 'AbortError'));
                };
                if (signal.aborted)
                    onAbort();
                else
                    signal.addEventListener('abort', onAbort, { once: true });
            }
        });
    }
}
function serializeBody(body, headers) {
    if (body === undefined || body === null)
        return undefined;
    if (typeof body === 'string') {
        // Caller serialized themselves; only set content-type if missing.
        if (!headers['Content-Type'])
            headers['Content-Type'] = 'application/json';
        return body;
    }
    if (body instanceof FormData || body instanceof Blob || body instanceof ArrayBuffer) {
        return body;
    }
    // Plain object → JSON.
    headers['Content-Type'] = 'application/json';
    return JSON.stringify(body);
}
async function parseResponseBody(response) {
    if (response.status === 204) {
        return undefined;
    }
    const text = await response.text();
    if (!text)
        return undefined;
    const contentType = response.headers.get('content-type') ?? '';
    if (contentType.includes('application/json')) {
        return JSON.parse(text);
    }
    // Non-JSON: return the raw text. Callers that expected JSON will
    // notice a string came back and surface a parse error themselves.
    return text;
}
function extractHeaders(headers) {
    const out = {};
    headers.forEach((value, key) => {
        out[key] = value;
    });
    return out;
}
//# sourceMappingURL=fetch-transport.js.map