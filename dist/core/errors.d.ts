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
export declare class AuthError extends Error {
    readonly code: string;
    readonly status?: number;
    readonly serverCode?: string;
    constructor(message: string, opts?: {
        code: string;
        status?: number;
        serverCode?: string;
        cause?: unknown;
    });
}
/** Bad request payload — typically a 400 from the server. */
export declare class ValidationError extends AuthError {
    constructor(message: string, opts?: {
        serverCode?: string;
        cause?: unknown;
    });
}
/** 401 — credentials wrong, token expired, refresh token revoked. */
export declare class UnauthenticatedError extends AuthError {
    constructor(message: string, opts?: {
        serverCode?: string;
        cause?: unknown;
    });
}
/** 403 — authenticated but not allowed (insufficient role, wrong org,
 * impersonation refused, org_assignable gate, etc.). */
export declare class ForbiddenError extends AuthError {
    constructor(message: string, opts?: {
        serverCode?: string;
        cause?: unknown;
    });
}
/** 404 — resource not found. */
export declare class NotFoundError extends AuthError {
    constructor(message: string, opts?: {
        serverCode?: string;
        cause?: unknown;
    });
}
/** 409 — conflict (duplicate email, owns org, etc.). */
export declare class ConflictError extends AuthError {
    constructor(message: string, opts?: {
        serverCode?: string;
        cause?: unknown;
    });
}
/** 429 — rate limited (per-IP or per-account). */
export declare class RateLimitedError extends AuthError {
    constructor(message: string, opts?: {
        serverCode?: string;
        cause?: unknown;
    });
}
/** 5xx — server or network failure. */
export declare class ServerError extends AuthError {
    constructor(message: string, opts?: {
        status?: number;
        serverCode?: string;
        cause?: unknown;
    });
}
/** Transport failure — DNS, TLS, abort, connection refused. */
export declare class NetworkError extends AuthError {
    constructor(message: string, opts?: {
        cause?: unknown;
    });
}
/** Thrown when a flow method is called on an AuthClient configured with
 * bootstrap='offline'. The mode is intentionally inert — read-state
 * methods return null/false rather than throw, but state-mutating flows
 * surface this so a caller never silently no-ops. */
export declare class OfflineModeError extends AuthError {
    constructor(operation: string);
}
/** Returned-as-flag flavor: when login succeeded except 2FA is required.
 * The SDK's default Login flow does NOT throw this — it resolves with
 * `{ requires_2fa: true }`. The class is here for consumers that want to
 * model the case as an exception. */
export declare class RequiresTwoFactorError extends AuthError {
    constructor(message?: string);
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
export declare function fromHttpResponse(status: number, body: unknown): AuthError;
//# sourceMappingURL=errors.d.ts.map