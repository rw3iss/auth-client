/**
 * Public type surface of `@vendidit/auth-client`.
 *
 * Wire shapes (`User`, `Organization`, `MyOrgRecord`, `TokenPair`,
 * `AuthResponse`) live in `@vendidit/auth-shared` so server-side consumers
 * (e.g. `@vendidit/auth-server-ts`) and the browser SDK refer to the
 * exact same definitions. The Go server is the source of truth — keep
 * `@vendidit/auth-shared/dto` in sync with the auth-server's emitted JSON.
 *
 * Browser-specific shapes (`AuthClientConfig`, `AuthSnapshot`,
 * `DecodedAccessToken`, port interfaces, event types) stay local — they're
 * SDK-architecture concerns, not server contracts.
 *
 * Conventions:
 *   - JSON-on-the-wire field names are snake_case (matching auth-server).
 *     We deliberately do NOT renormalize to camelCase here — keeping the
 *     wire shape in the SDK saves a translation layer and means a user
 *     who logs `tokens` sees the same shape the server emitted.
 *   - Public types are flat / serializable: never function-valued, never
 *     containing closures. So the same shapes can be safely persisted
 *     (e.g., in a token store) or passed across a BroadcastChannel.
 *   - Dates / timestamps are kept in their wire form (RFC3339 string or
 *     Unix-seconds number) to avoid Date object identity quirks across
 *     module boundaries.
 */
export {};
//# sourceMappingURL=types.js.map