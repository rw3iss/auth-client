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
import { type FlowDeps } from './flow-deps.js';
export interface VerifyEmailRequest {
    token: string;
}
export interface ResendVerificationRequest {
    email: string;
    /** Optional app context for template selection. */
    appCode?: string;
}
export declare class EmailVerificationFlow {
    private readonly deps;
    constructor(deps: FlowDeps);
    /**
     * POST /auth/verify-email — consume the single-use verification
     * token. After success, the user's account is flagged as verified
     * server-side; subsequent /auth/me responses reflect that state.
     */
    verify(req: VerifyEmailRequest): Promise<void>;
    /**
     * POST /auth/verify-email/resend — request a fresh verification
     * email. Always 200 from the server's perspective.
     */
    resend(req: ResendVerificationRequest): Promise<void>;
}
//# sourceMappingURL=email-verification.flow.d.ts.map