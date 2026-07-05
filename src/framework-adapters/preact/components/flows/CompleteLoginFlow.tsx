/** @jsxImportSource preact */
import { LoginForm } from '../forms/LoginForm.js';
import { SsoButtonGroup } from '../atoms/SsoButtonGroup.js';
import type { AuthClient } from '../../../../core/auth-client.js';
import type { AuthResponse } from '../../../../core/types.js';

/**
 * "Sign in" page — opinionated composition of:
 *   - SsoButtonGroup (all four built-in providers)
 *   - A subtle divider
 *   - LoginForm (with the 2FA prompt path built in)
 *   - "No account? Sign up →" affordance below
 *
 * Drop in your /login route. For more control, render LoginForm +
 * SsoButtonGroup yourself.
 */
export interface CompleteLoginFlowProps {
    client?: AuthClient;
    /** Where to redirect SSO callbacks. Default: `${origin}/auth/callback`. */
    ssoRedirectUrl?: string;
    forgotPasswordHref?: string;
    registerHref?: string;
    onSuccess?: (resp: AuthResponse) => void;
    className?: string;
}

export function CompleteLoginFlow(props: CompleteLoginFlowProps) {
    const redirect = props.ssoRedirectUrl ??
        (typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : '/auth/callback');
    return (
        <div class={`vauth-flow vauth-flow-login ${props.className ?? ''}`}>
            <header class="vauth-flow-header">
                <h1>Sign in</h1>
                <p class="vauth-flow-sub">Welcome back. Pick a sign-in method.</p>
            </header>
            <SsoButtonGroup
                redirectUrl={redirect}
                {...(props.client !== undefined && { client: props.client })}
            />
            <div class="vauth-divider" role="separator"><span>or with email</span></div>
            <LoginForm
                {...(props.client !== undefined && { client: props.client })}
                {...(props.forgotPasswordHref && { forgotPasswordHref: props.forgotPasswordHref })}
                {...(props.onSuccess && { onSuccess: props.onSuccess })}
            />
            {props.registerHref && (
                <p class="vauth-flow-footer">
                    No account? <a href={props.registerHref}>Create one</a>
                </p>
            )}
        </div>
    );
}
