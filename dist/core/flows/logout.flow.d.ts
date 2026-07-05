/**
 * Logout flows: per-session and logout-everywhere.
 *
 * The auth-server's /auth/logout requires the refresh token (so it can
 * revoke the right row) but does NOT require the access token; we still
 * skip the auth header to avoid leaking which session was active.
 * /auth/logout/all DOES require the access token — it's a protected
 * endpoint that identifies the user via the JWT and bumps their token
 * version.
 */
import { type FlowDeps } from './flow-deps.js';
export interface LogoutRequest {
    refresh_token: string;
}
export declare class LogoutFlow {
    private readonly deps;
    constructor(deps: FlowDeps);
    execute(req: LogoutRequest): Promise<void>;
    executeAll(): Promise<void>;
}
//# sourceMappingURL=logout.flow.d.ts.map