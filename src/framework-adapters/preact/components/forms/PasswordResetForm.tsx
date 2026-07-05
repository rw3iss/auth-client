/** @jsxImportSource preact */
import { useState } from 'preact/hooks';
import { useResetPassword } from '../../actions.js';
import { PasswordStrengthMeter } from '../atoms/PasswordStrengthMeter.js';
import type { AuthClient } from '../../../../core/auth-client.js';

/**
 * Reset-password form, completing the flow started by the
 * "forgot password" email. Mount this on the route the reset email
 * links to (e.g. /auth/reset?token=...) and pass `token` from the URL.
 *
 * On success, the new password is set server-side; this form does NOT
 * automatically log the user in — they get a "now sign in" affordance.
 * Wire `onSuccess` to redirect to /login.
 */
export interface PasswordResetFormProps {
    /** The single-use token from the reset email link. */
    token: string;
    client?: AuthClient;
    onSuccess?: () => void;
    onError?: (err: Error) => void;
    /** Route the "Sign in" affordance points to on success. */
    loginHref?: string;
    className?: string;
}

export function PasswordResetForm(props: PasswordResetFormProps) {
    const action = useResetPassword(props.client);
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);

    const onSubmit = async (e: Event) => {
        e.preventDefault();
        setLocalError(null);
        if (password !== confirm) {
            setLocalError("Passwords don't match.");
            return;
        }
        try {
            await action.run({ token: props.token, newPassword: password });
            setSubmitted(true);
            props.onSuccess?.();
        } catch (err) {
            props.onError?.(err instanceof Error ? err : new Error(String(err)));
        }
    };

    if (submitted) {
        return (
            <div class={`vauth-form-success ${props.className ?? ''}`} role="status">
                <p>Your password has been updated.</p>
                {props.loginHref && (
                    <a class="vauth-btn vauth-btn-primary" href={props.loginHref}>Sign in</a>
                )}
            </div>
        );
    }

    const displayError = localError ?? action.error?.message ?? null;
    return (
        <form class={`vauth-form vauth-password-reset-form ${props.className ?? ''}`} onSubmit={onSubmit} noValidate>
            <label class="vauth-field">
                <span class="vauth-field-label">New password</span>
                <input
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    value={password}
                    onInput={(e) => setPassword((e.target as HTMLInputElement).value)}
                    disabled={action.loading}
                />
                <PasswordStrengthMeter password={password} />
            </label>
            <label class="vauth-field">
                <span class="vauth-field-label">Confirm new password</span>
                <input
                    type="password"
                    autoComplete="new-password"
                    required
                    value={confirm}
                    onInput={(e) => setConfirm((e.target as HTMLInputElement).value)}
                    disabled={action.loading}
                />
            </label>
            {displayError && <div class="vauth-error" role="alert">{displayError}</div>}
            <button
                type="submit"
                class="vauth-btn vauth-btn-primary"
                disabled={action.loading}
                aria-busy={action.loading}
            >
                {action.loading ? 'Updating…' : 'Update password'}
            </button>
        </form>
    );
}
