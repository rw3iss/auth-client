/**
 * `client.sessions` — the signed-in user's OWN device sessions.
 * Admin-side session control over other users lives in
 * `client.users` (listSessions / terminateSession / revokeSessions).
 */
import type { ModuleContext } from '../module-context.js';
import type { SessionRecord } from '../flows/sessions.flow.js';

export class SessionsModule {
    constructor(private readonly ctx: ModuleContext) {}

    /** List the current user's active sessions across devices. */
    async list(): Promise<SessionRecord[]> {
        this.ctx.guard('getSessions');
        return this.ctx.flows.sessions.list();
    }

    /**
     * Terminate a specific session. Passing the caller's own session id
     * logs them out as a side-effect.
     */
    async terminate(sessionId: string): Promise<void> {
        this.ctx.guard('terminateSession');
        await this.ctx.flows.sessions.terminate(sessionId);
    }
}
