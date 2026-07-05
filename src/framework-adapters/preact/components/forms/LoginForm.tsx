/** @jsxImportSource preact */
import { useState } from 'preact/hooks';
import type { ComponentChildren } from 'preact';
import { useLogin } from '../../actions.js';
import type { AuthClient } from '../../../../core/auth-client.js';
import type { AuthResponse } from '../../../../core/types.js';

/**
 * Password login form. Handles the full credential-submit lifecycle:
 *   - Email + password fields
 *   - Optional "remember me" checkbox
 *   - Surfaces server errors (rate limit, invalid creds, 2FA-required)
 *   - If the server returns `requires_2fa`, swaps in the TOTP code field
 *     and re-submits with the second factor.
 *
 * Slots:
 *   - `forgotPasswordHref` — link rendered next to the password input
 *   - `belowSubmit` — slot for SSO buttons, "create account" link, etc.
 *
 * On success: calls `onSuccess(authResponse)` and the AuthClient's
 * snapshot transitions to `authenticated` (your `<ProtectedRoute>` /
 * `<GuestOnly>` wrappers will react automatically).
 */
export interface LoginFormProps {
    client?: AuthClient;
    /** Pre-fill the email field (e.g. from a magic link). */
    defaultEmail?: string;
    /** Where the "Forgot password?" link points. Hide by omitting. */
    forgotPasswordHref?: string;
    /** Slot rendered under the submit button — typically the SSO group. */
    belowSubmit?: ComponentChildren;
    /** Slot rendered above the form. */
    aboveForm?: ComponentChildren;
    onSuccess?: (resp: AuthResponse) => void;
    onError?: (err: Error) => void;
    organizationId?: string;
    className?: string;
}

export function LoginForm(props: LoginFormProps) {
    const login = useLogin(props.client);
    const [email, setEmail] = useState(props.defaultEmail ?? '');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [needs2fa, setNeeds2fa] = useState(false);
    const [twoFactorCode, setTwoFactorCode] = useState('');
    const [localError, setLocalError] = useState<string | null>(null);

    const onSubmit = async (e: Event) => {
        e.preventDefault();
        setLocalError(null);
        try {
            const resp = await login.run({
                email,
                password,
                ...(rememberMe && { rememberMe: true }),
                ...(needs2fa && twoFactorCode && { twoFactorCode }),
                ...(props.organizationId && { organizationId: props.organizationId }),
            });
            if (resp.requires_2fa) {
                setNeeds2fa(true);
                return;
            }
            props.onSuccess?.(resp);
        } catch (err) {
            const e = err instanceof Error ? err : new Error(String(err));
            setLocalError(e.message);
            props.onError?.(e);
        }
    };

    const displayError = localError ?? login.error?.message ?? null;
    return (
        <form class={`vauth-form vauth-login-form ${props.className ?? ''}`} onSubmit={onSubmit} noValidate>
            {props.aboveForm}
            <label class="vauth-field">
                <span class="vauth-field-label">Email</span>
                <input
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onInput={(e) => setEmail((e.target as HTMLInputElement).value)}
                    disabled={login.loading}
                />
            </label>
            <label class="vauth-field">
                <span class="vauth-field-label">
                    Password
                    {props.forgotPasswordHref && (
                        <a class="vauth-field-link" href={props.forgotPasswordHref}>Forgot?</a>
                    )}
                </span>
                <input
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onInput={(e) => setPassword((e.target as HTMLInputElement).value)}
                    disabled={login.loading}
                />
            </label>
            {needs2fa && (
                <label class="vauth-field">
                    <span class="vauth-field-label">Two-factor code</span>
                    <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        autoComplete="one-time-code"
                        maxLength={6}
                        required
                        value={twoFactorCode}
                        onInput={(e) => setTwoFactorCode((e.target as HTMLInputElement).value)}
                        disabled={login.loading}
                        autoFocus
                    />
                    <span class="vauth-field-hint">From your authenticator app</span>
                </label>
            )}
            <label class="vauth-field-inline">
                <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe((e.target as HTMLInputElement).checked)}
                    disabled={login.loading}
                />
                <span>Keep me signed in</span>
            </label>
            {displayError && (
                <div class="vauth-error" role="alert">{displayError}</div>
            )}
            <button
                type="submit"
                class="vauth-btn vauth-btn-primary"
                disabled={login.loading}
                aria-busy={login.loading}
            >
                {login.loading ? 'Signing in…' : (needs2fa ? 'Verify and sign in' : 'Sign in')}
            </button>
            {props.belowSubmit}
        </form>
    );
}
