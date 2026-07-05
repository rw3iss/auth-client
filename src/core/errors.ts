/**
 * Typed error classes. All thrown from the SDK extend AuthError so a
 * consumer can `try { ... } catch (e) { if (e instanceof AuthError) ... }`.
 *
 * Errors carry both a machine-readable `code` (stable across versions) and
 * a `cause` chain when the failure originated lower in the stack (network
 * error, crypto failure, etc.). The HTTP status, when relevant, is
 * preserved on `status` so error UIs can branch without re-parsing.
 *
 * Design notes:
 *
 *   - We deliberately don't expose every server error code as a class.
 *     The server uses a wide `ErrCode` enum; surfacing each as a class
 *     would couple the SDK to every server-side change. Instead we map
 *     the common HTTP families (4xx vs 5xx) to a few coarse buckets and
 *     stash the server's `code` on the error for fine-grained branching.
 *
 *   - `RequiresTwoFactorError` is NOT thrown as an exception in the
 *     normal flow — it's an event-shaped response (LoginResult.requires_2fa
 *     true). The class exists for the case where a consumer chooses to
 *     model the 401-with-requires_2fa branch as an exception in their app.
 */

export class AuthError extends Error {
    readonly code: string;
    readonly status?: number;
    readonly serverCode?: string;
    constructor(
        message: string,
        opts: { code: string; status?: number; serverCode?: string; cause?: unknown } = {
            code: 'auth_error',
        },
    ) {
        super(message);
        this.name = 'AuthError';
        this.code = opts.code;
        if (opts.status !== undefined) this.status = opts.status;
        if (opts.serverCode !== undefined) this.serverCode = opts.serverCode;
        if (opts.cause !== undefined) {
            (this as { cause?: unknown }).cause = opts.cause;
        }
    }
}

/** Bad request payload — typically a 400 from the server. */
export class ValidationError extends AuthError {
    constructor(message: string, opts: { serverCode?: string; cause?: unknown } = {}) {
        super(message, { code: 'validation', status: 400, ...opts });
        this.name = 'ValidationError';
    }
}

/** 401 — credentials wrong, token expired, refresh token revoked. */
export class UnauthenticatedError extends AuthError {
    constructor(message: string, opts: { serverCode?: string; cause?: unknown } = {}) {
        super(message, { code: 'unauthenticated', status: 401, ...opts });
        this.name = 'UnauthenticatedError';
    }
}

/** 403 — authenticated but not allowed (insufficient role, wrong org,
 * impersonation refused, org_assignable gate, etc.). */
export class ForbiddenError extends AuthError {
    constructor(message: string, opts: { serverCode?: string; cause?: unknown } = {}) {
        super(message, { code: 'forbidden', status: 403, ...opts });
        this.name = 'ForbiddenError';
    }
}

/** 404 — resource not found. */
export class NotFoundError extends AuthError {
    constructor(message: string, opts: { serverCode?: string; cause?: unknown } = {}) {
        super(message, { code: 'not_found', status: 404, ...opts });
        this.name = 'NotFoundError';
    }
}

/** 409 — conflict (duplicate email, owns org, etc.). */
export class ConflictError extends AuthError {
    constructor(message: string, opts: { serverCode?: string; cause?: unknown } = {}) {
        super(message, { code: 'conflict', status: 409, ...opts });
        this.name = 'ConflictError';
    }
}

/** 429 — rate limited (per-IP or per-account). */
export class RateLimitedError extends AuthError {
    constructor(message: string, opts: { serverCode?: string; cause?: unknown } = {}) {
        super(message, { code: 'rate_limited', status: 429, ...opts });
        this.name = 'RateLimitedError';
    }
}

/** 5xx — server or network failure. */
export class ServerError extends AuthError {
    constructor(
        message: string,
        opts: { status?: number; serverCode?: string; cause?: unknown } = {},
    ) {
        super(message, { code: 'server_error', status: opts.status ?? 500, ...opts });
        this.name = 'ServerError';
    }
}

/** Transport failure — DNS, TLS, abort, connection refused. */
export class NetworkError extends AuthError {
    constructor(message: string, opts: { cause?: unknown } = {}) {
        super(message, { code: 'network_error', ...opts });
        this.name = 'NetworkError';
    }
}

/** Thrown when a flow method is called on an AuthClient configured with
 * bootstrap='offline'. The mode is intentionally inert — read-state
 * methods return null/false rather than throw, but state-mutating flows
 * surface this so a caller never silently no-ops. */
export class OfflineModeError extends AuthError {
    constructor(operation: string) {
        super(`auth-client is in offline mode — ${operation} is disabled`, {
            code: 'offline_mode',
        });
        this.name = 'OfflineModeError';
    }
}

/** Returned-as-flag flavor: when login succeeded except 2FA is required.
 * The SDK's default Login flow does NOT throw this — it resolves with
 * `{ requires_2fa: true }`. The class is here for consumers that want to
 * model the case as an exception. */
export class RequiresTwoFactorError extends AuthError {
    constructor(message = 'two-factor authentication required') {
        super(message, { code: 'requires_2fa', status: 401 });
        this.name = 'RequiresTwoFactorError';
    }
}

/**
 * Map an HTTP response from the auth-server into the right AuthError
 * subclass. Centralizes the status→class lookup so every flow uses the
 * same mapping.
 *
 * The server's error envelope looks like:
 *   { error: { code: "INVALID_CREDENTIALS", message: "...", status: 401 } }
 *
 * We extract `code` and `message` defensively — if the body isn't the
 * expected shape, we fall back to the HTTP status text.
 */
export function fromHttpResponse(
    status: number,
    body: unknown,
): AuthError {
    const envelope = parseErrorEnvelope(body);
    const message = envelope.message || `request failed with status ${status}`;
    const serverCode = envelope.code;

    if (status === 400) return new ValidationError(message, { serverCode });
    if (status === 401) return new UnauthenticatedError(message, { serverCode });
    if (status === 403) return new ForbiddenError(message, { serverCode });
    if (status === 404) return new NotFoundError(message, { serverCode });
    if (status === 409) return new ConflictError(message, { serverCode });
    if (status === 429) return new RateLimitedError(message, { serverCode });
    if (status >= 500) return new ServerError(message, { status, serverCode });
    return new AuthError(message, { code: 'http_error', status, serverCode });
}

interface ErrorEnvelope {
    code?: string;
    message?: string;
}

function parseErrorEnvelope(body: unknown): ErrorEnvelope {
    if (typeof body !== 'object' || body === null) return {};
    const b = body as { error?: { code?: string; message?: string }; message?: string };
    if (b.error && typeof b.error === 'object') {
        return { code: b.error.code, message: b.error.message };
    }
    if (typeof b.message === 'string') return { message: b.message };
    return {};
}
