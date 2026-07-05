/**
 * `client.sessions` — the signed-in user's OWN device sessions.
 * Admin-side session control over other users lives in
 * `client.users` (listSessions / terminateSession / revokeSessions).
 */
import type { ModuleContext } from '../module-context.js';
import type { SessionRecord } from '../flows/sessions.flow.js';
export declare class SessionsModule {
    private readonly ctx;
    constructor(ctx: ModuleContext);
    /** List the current user's active sessions across devices. */
    list(): Promise<SessionRecord[]>;
    /**
     * Terminate a specific session. Passing the caller's own session id
     * logs them out as a side-effect.
     */
    terminate(sessionId: string): Promise<void>;
}
//# sourceMappingURL=sessions.module.d.ts.map