import type { ComponentChildren } from 'preact';
import type { AuthClient } from '../../../../core/auth-client.js';
/**
 * "Check your email to verify" notice. Designed for the post-register
 * landing page — shows the email being verified and a "resend" button.
 *
 * If `email` is omitted, falls back to the AuthClient's current
 * snapshot user. If the user is already verified, renders the
 * `verifiedSlot` (default: nothing, so the notice disappears).
 */
export interface EmailVerificationNoticeProps {
    client?: AuthClient;
    /** Explicit email override. Default: current user's email. */
    email?: string;
    /** Rendered when verification is already complete. */
    verifiedSlot?: ComponentChildren;
    appCode?: string;
    className?: string;
}
export declare function EmailVerificationNotice(props: EmailVerificationNoticeProps): import("preact").JSX.Element | null;
//# sourceMappingURL=EmailVerificationNotice.d.ts.map