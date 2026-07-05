/** @jsxImportSource preact */
import { useState } from 'preact/hooks';
import type { ComponentChildren } from 'preact';
import { useResendVerificationEmail } from '../../actions.js';
import { useAuth } from '../../hooks.js';
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

export function EmailVerificationNotice(props: EmailVerificationNoticeProps) {
    const snap = useAuth(props.client);
    const resend = useResendVerificationEmail(props.client);
    const [sentAt, setSentAt] = useState<number | null>(null);

    const email = props.email ?? snap.user?.email;
    if (!email) return null;

    const onResend = async () => {
        await resend.run({ email, ...(props.appCode && { appCode: props.appCode }) });
        setSentAt(Date.now());
    };

    return (
        <div class={`vauth-verify-notice ${props.className ?? ''}`}>
            <div class="vauth-verify-notice-icon" aria-hidden="true">📧</div>
            <div class="vauth-verify-notice-body">
                <h3 class="vauth-verify-notice-title">Check your email</h3>
                <p class="vauth-verify-notice-text">
                    We sent a verification link to <strong>{email}</strong>.
                    Click the link in that email to confirm your address.
                </p>
                {sentAt && (
                    <p class="vauth-verify-notice-confirm" role="status">
                        Resent — check your inbox.
                    </p>
                )}
                <button
                    type="button"
                    class="vauth-btn vauth-btn-ghost"
                    onClick={onResend}
                    disabled={resend.loading}
                    aria-busy={resend.loading}
                >
                    {resend.loading ? 'Sending…' : 'Resend verification email'}
                </button>
            </div>
        </div>
    );
}
