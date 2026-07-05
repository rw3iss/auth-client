/** @jsxImportSource preact */
import { useState } from 'preact/hooks';
import { useChangePassword } from '../../actions.js';
import { PasswordStrengthMeter } from '../atoms/PasswordStrengthMeter.js';
import type { AuthClient } from '../../../../core/auth-client.js';

/**
 * Change-password form for the currently-signed-in user. Authenticated
 * flow; the server requires the current password as a re-auth defense.
 *
 * After success, the caller's existing tokens remain valid (the
 * server doesn't bump the token-version on a password change unless
 * the caller follows up with `logoutAll()`). Render a
 * `<LogoutAllButton>` near this form so users can opt to terminate
 * other devices after the rotation.
 */
export interface ChangePasswordFormProps {
    client?: AuthClient;
    onSuccess?: () => void;
    onError?: (err: Error) => void;
    className?: string;
}

export function ChangePasswordForm(props: ChangePasswordFormProps) {
    const action = useChangePassword(props.client);
    const [current, setCurrent] = useState('');
    const [next, setNext] = useState('');
    const [confirm, setConfirm] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);

    const onSubmit = async (e: Event) => {
        e.preventDefault();
        setLocalError(null);
        if (next !== confirm) {
            setLocalError("New passwords don't match.");
            return;
        }
        if (next === current) {
            setLocalError("New password must differ from the current one.");
            return;
        }
        try {
            await action.run({ currentPassword: current, newPassword: next });
            setSubmitted(true);
            setCurrent('');
            setNext('');
            setConfirm('');
            props.onSuccess?.();
        } catch (err) {
            props.onError?.(err instanceof Error ? err : new Error(String(err)));
        }
    };

    const displayError = localError ?? action.error?.message ?? null;
    return (
        <form class={`vauth-form vauth-change-password-form ${props.className ?? ''}`} onSubmit={onSubmit} noValidate>
            <label class="vauth-field">
                <span class="vauth-field-label">Current password</span>
                <input
                    type="password"
                    autoComplete="current-password"
                    required
                    value={current}
                    onInput={(e) => setCurrent((e.target as HTMLInputElement).value)}
                    disabled={action.loading}
                />
            </label>
            <label class="vauth-field">
                <span class="vauth-field-label">New password</span>
                <input
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    value={next}
                    onInput={(e) => setNext((e.target as HTMLInputElement).value)}
                    disabled={action.loading}
                />
                <PasswordStrengthMeter password={next} />
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
            {submitted && !displayError && (
                <div class="vauth-form-success" role="status">Password updated.</div>
            )}
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
