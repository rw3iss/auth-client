/** @jsxImportSource preact */
import { useState } from 'preact/hooks';
import { useDisableTwoFactor } from '../../actions.js';
import type { AuthClient } from '../../../../core/auth-client.js';

/**
 * Disable 2FA. Server requires BOTH the current password and a fresh
 * TOTP code as defense against accidental / hijack-driven disable.
 * On success, the user's token-version is bumped so every existing
 * session learns 2FA is off (otherwise users could see stale UI).
 */
export interface TwoFactorDisableFormProps {
    client?: AuthClient;
    onSuccess?: () => void;
    onError?: (err: Error) => void;
    className?: string;
}

export function TwoFactorDisableForm(props: TwoFactorDisableFormProps) {
    const action = useDisableTwoFactor(props.client);
    const [password, setPassword] = useState('');
    const [code, setCode] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const onSubmit = async (e: Event) => {
        e.preventDefault();
        try {
            await action.run({ password, code });
            setSubmitted(true);
            setPassword('');
            setCode('');
            props.onSuccess?.();
        } catch (err) {
            props.onError?.(err instanceof Error ? err : new Error(String(err)));
        }
    };

    if (submitted) {
        return (
            <div class={`vauth-form-success ${props.className ?? ''}`} role="status">
                Two-factor authentication disabled.
            </div>
        );
    }

    return (
        <form class={`vauth-form vauth-2fa-disable-form ${props.className ?? ''}`} onSubmit={onSubmit} noValidate>
            <label class="vauth-field">
                <span class="vauth-field-label">Password</span>
                <input
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onInput={(e) => setPassword((e.target as HTMLInputElement).value)}
                    disabled={action.loading}
                />
            </label>
            <label class="vauth-field">
                <span class="vauth-field-label">Current 2FA code</span>
                <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    autoComplete="one-time-code"
                    required
                    value={code}
                    onInput={(e) => setCode((e.target as HTMLInputElement).value)}
                    disabled={action.loading}
                />
            </label>
            {action.error && <div class="vauth-error" role="alert">{action.error.message}</div>}
            <button
                type="submit"
                class="vauth-btn vauth-btn-danger"
                disabled={action.loading || code.length !== 6}
                aria-busy={action.loading}
            >
                {action.loading ? 'Disabling…' : 'Disable 2FA'}
            </button>
        </form>
    );
}
