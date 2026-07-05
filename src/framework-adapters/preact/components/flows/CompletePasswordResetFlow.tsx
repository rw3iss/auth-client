/** @jsxImportSource preact */
import { PasswordResetRequestForm } from '../forms/PasswordResetRequestForm.js';
import { PasswordResetForm } from '../forms/PasswordResetForm.js';
import type { AuthClient } from '../../../../core/auth-client.js';

/**
 * Combined password-reset surface — branches on whether a token was
 * provided:
 *
 *   - No token → renders the "send me a reset link" request form.
 *   - Token present → renders the new-password form that completes
 *     the reset.
 *
 * Mount this on a single /auth/reset route and pass `token` from the
 * URL search params. The router can keep one route handler instead of
 * two.
 */
export interface CompletePasswordResetFlowProps {
    client?: AuthClient;
    /** Reset token from the email link, if present. */
    token?: string;
    loginHref?: string;
    className?: string;
}

export function CompletePasswordResetFlow(props: CompletePasswordResetFlowProps) {
    if (props.token) {
        return (
            <div class={`vauth-flow vauth-flow-reset ${props.className ?? ''}`}>
                <header class="vauth-flow-header">
                    <h1>Set a new password</h1>
                    <p class="vauth-flow-sub">Choose something you don't use elsewhere.</p>
                </header>
                <PasswordResetForm
                    token={props.token}
                    {...(props.client !== undefined && { client: props.client })}
                    {...(props.loginHref && { loginHref: props.loginHref })}
                />
            </div>
        );
    }
    return (
        <div class={`vauth-flow vauth-flow-reset-request ${props.className ?? ''}`}>
            <header class="vauth-flow-header">
                <h1>Reset your password</h1>
                <p class="vauth-flow-sub">We'll email you a link to set a new one.</p>
            </header>
            <PasswordResetRequestForm
                {...(props.client !== undefined && { client: props.client })}
            />
            {props.loginHref && (
                <p class="vauth-flow-footer">
                    Remembered it? <a href={props.loginHref}>Back to sign in</a>
                </p>
            )}
        </div>
    );
}
