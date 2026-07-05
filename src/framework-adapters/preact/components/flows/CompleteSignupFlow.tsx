/** @jsxImportSource preact */
import { useState } from 'preact/hooks';
import { RegisterForm } from '../forms/RegisterForm.js';
import { EmailVerificationNotice } from '../forms/EmailVerificationNotice.js';
import { SsoButtonGroup } from '../atoms/SsoButtonGroup.js';
import type { AuthClient } from '../../../../core/auth-client.js';
import type { AuthResponse } from '../../../../core/types.js';

/**
 * Full registration flow: collect details → register → display
 * post-signup "check your email" notice. Composes RegisterForm +
 * SsoButtonGroup (for sign-up-via-SSO) + EmailVerificationNotice.
 *
 * After a successful register, the AuthClient is already signed in
 * (the server returns a token pair). The verification step is
 * advisory — most apps treat unverified accounts as functional but
 * gate certain actions on verification.
 */
export interface CompleteSignupFlowProps {
    client?: AuthClient;
    ssoRedirectUrl?: string;
    loginHref?: string;
    onSuccess?: (resp: AuthResponse) => void;
    className?: string;
}

export function CompleteSignupFlow(props: CompleteSignupFlowProps) {
    const [registered, setRegistered] = useState<AuthResponse | null>(null);
    const redirect = props.ssoRedirectUrl ??
        (typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : '/auth/callback');

    if (registered) {
        return (
            <div class={`vauth-flow vauth-flow-signup-success ${props.className ?? ''}`}>
                <header class="vauth-flow-header">
                    <h1>Account created</h1>
                    <p class="vauth-flow-sub">One last step.</p>
                </header>
                <EmailVerificationNotice
                    {...(props.client !== undefined && { client: props.client })}
                    {...(registered.user?.email && { email: registered.user.email })}
                />
            </div>
        );
    }

    return (
        <div class={`vauth-flow vauth-flow-signup ${props.className ?? ''}`}>
            <header class="vauth-flow-header">
                <h1>Create your account</h1>
                <p class="vauth-flow-sub">Start with SSO or fill in the form below.</p>
            </header>
            <SsoButtonGroup
                redirectUrl={redirect}
                {...(props.client !== undefined && { client: props.client })}
            />
            <div class="vauth-divider" role="separator"><span>or with email</span></div>
            <RegisterForm
                {...(props.client !== undefined && { client: props.client })}
                onSuccess={(resp) => {
                    setRegistered(resp);
                    props.onSuccess?.(resp);
                }}
            />
            {props.loginHref && (
                <p class="vauth-flow-footer">
                    Already have an account? <a href={props.loginHref}>Sign in</a>
                </p>
            )}
        </div>
    );
}
