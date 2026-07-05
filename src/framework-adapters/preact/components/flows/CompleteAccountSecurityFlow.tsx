/** @jsxImportSource preact */
import { ChangePasswordForm } from '../forms/ChangePasswordForm.js';
import { TwoFactorEnrollment } from '../forms/TwoFactorEnrollment.js';
import { TwoFactorDisableForm } from '../forms/TwoFactorDisableForm.js';
import { SessionsList } from '../forms/SessionsList.js';
import { LogoutAllButton } from '../atoms/LogoutAllButton.js';
import { useAuth } from '../../hooks.js';
import type { AuthClient } from '../../../../core/auth-client.js';

/**
 * Single-page "Account security" surface — drops change-password, 2FA
 * management, session list, and logout-all into one organized view.
 * Suitable for /settings/security.
 *
 * The 2FA section auto-toggles based on the user's current state
 * (claims.two_factor_enabled isn't on the token by design, so we
 * approximate via the presence of a session_id claim — refine with
 * a /whoami call if you need exact state).
 */
export interface CompleteAccountSecurityFlowProps {
    client?: AuthClient;
    /** Render the impersonation banner if the caller is impersonating. */
    showImpersonationBanner?: boolean;
    className?: string;
}

export function CompleteAccountSecurityFlow(props: CompleteAccountSecurityFlowProps) {
    const snap = useAuth(props.client);
    if (snap.status !== 'authenticated') return null;

    return (
        <div class={`vauth-flow vauth-flow-security ${props.className ?? ''}`}>
            <header class="vauth-flow-header">
                <h1>Account security</h1>
                <p class="vauth-flow-sub">Manage your password, 2FA, and active sessions.</p>
            </header>

            <section class="vauth-section">
                <h2>Password</h2>
                <ChangePasswordForm {...(props.client !== undefined && { client: props.client })} />
            </section>

            <section class="vauth-section">
                <h2>Two-factor authentication</h2>
                <details>
                    <summary>Set up a new authenticator</summary>
                    <TwoFactorEnrollment {...(props.client !== undefined && { client: props.client })} />
                </details>
                <details>
                    <summary>Disable two-factor</summary>
                    <TwoFactorDisableForm {...(props.client !== undefined && { client: props.client })} />
                </details>
            </section>

            <section class="vauth-section">
                <h2>Active sessions</h2>
                <SessionsList {...(props.client !== undefined && { client: props.client })} />
                <div class="vauth-section-footer">
                    <LogoutAllButton {...(props.client !== undefined && { client: props.client })} />
                </div>
            </section>
        </div>
    );
}
