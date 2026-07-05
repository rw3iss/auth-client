export class SessionsModule {
    ctx;
    constructor(ctx) {
        this.ctx = ctx;
    }
    /** List the current user's active sessions across devices. */
    async list() {
        this.ctx.guard('getSessions');
        return this.ctx.flows.sessions.list();
    }
    /**
     * Terminate a specific session. Passing the caller's own session id
     * logs them out as a side-effect.
     */
    async terminate(sessionId) {
        this.ctx.guard('terminateSession');
        await this.ctx.flows.sessions.terminate(sessionId);
    }
}
//# sourceMappingURL=sessions.module.js.map