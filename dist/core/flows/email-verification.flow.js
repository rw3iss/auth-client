/**
 * Email-verification flow:
 *
 *   - `verify(token)` — anonymous; consumes the single-use token from
 *     the verification email and flips the user's `email_verified` flag
 *     server-side. Audit 1.2 — token is single-use.
 *
 *   - `resend(email)` — anonymous; re-issues a verification email. The
 *     server always responds 200 regardless of whether the email exists
 *     or whether it's already verified (anti-enumeration, AUDIT 5.4).
 */
import { ensureOk } from './flow-deps.js';
export class EmailVerificationFlow {
    deps;
    constructor(deps) {
        this.deps = deps;
    }
    /**
     * POST /auth/verify-email — consume the single-use verification
     * token. After success, the user's account is flagged as verified
     * server-side; subsequent /auth/me responses reflect that state.
     */
    async verify(req) {
        const resp = await this.deps.ports.transport.request({
            method: 'POST',
            url: `${this.deps.apiBaseUrl}/auth/verify-email`,
            body: { token: req.token },
        });
        await ensureOk(resp);
    }
    /**
     * POST /auth/verify-email/resend — request a fresh verification
     * email. Always 200 from the server's perspective.
     */
    async resend(req) {
        const resp = await this.deps.ports.transport.request({
            method: 'POST',
            url: `${this.deps.apiBaseUrl}/auth/verify-email/resend`,
            body: {
                email: req.email,
                ...(req.appCode && { app_code: req.appCode }),
            },
        });
        await ensureOk(resp);
    }
}
//# sourceMappingURL=email-verification.flow.js.map