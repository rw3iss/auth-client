/**
 * Shared dependency bundle for every flow. Each flow takes one of these
 * in its constructor so the AuthClient facade owns the dependency graph
 * and flows don't need to know about each other.
 *
 * Convention: every method on a flow takes a request DTO that mirrors
 * the server's wire format (snake_case keys). The flow handles
 * serialization + HTTP via deps.ports.transport.
 */

import type { AuthClientPorts } from '../types.js';

export interface FlowDeps {
    apiBaseUrl: string;
    ports: AuthClientPorts;
    /** Default app code for endpoints that need it. Individual calls
     * can override via their request DTO. */
    appCode?: string | undefined;
}

/**
 * Helper: throw the appropriate AuthError subclass for a non-2xx
 * response. Imported lazily by flows to avoid pulling errors.ts into
 * every module that doesn't need it on the success path.
 */
export async function ensureOk(resp: { ok: boolean; status: number; body: unknown }): Promise<void> {
    if (resp.ok) return;
    const { fromHttpResponse } = await import('../errors.js');
    throw fromHttpResponse(resp.status, resp.body);
}
