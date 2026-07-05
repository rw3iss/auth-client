/** @jsxImportSource preact */
import { useState } from 'preact/hooks';
import { useRequestPasswordReset } from '../../actions.js';
import type { AuthClient } from '../../../../core/auth-client.js';

/**
 * "Forgot your password?" form. Anonymous flow — does not require a
 * session. On submit, POST /auth/password/reset-request. The server
 * always responds 200 regardless of whether the email is registered
 * (anti-enumeration), so the success state simply tells the user to
 * check their inbox.
 */
export interface PasswordResetRequestFormProps {
    client?: AuthClient;
    /** Pre-fill from a query param (?email=...). */
    defaultEmail?: string;
    /** Override the success message. */
    successMessage?: string;
    onSuccess?: () => void;
    onError?: (err: Error) => void;
    className?: string;
}

export function PasswordResetRequestForm(props: PasswordResetRequestFormProps) {
    const action = useRequestPasswordReset(props.client);
    const [email, setEmail] = useState(props.defaultEmail ?? '');
    const [submitted, setSubmitted] = useState(false);

    const onSubmit = async (e: Event) => {
        e.preventDefault();
        try {
            await action.run({ email });
            setSubmitted(true);
            props.onSuccess?.();
        } catch (err) {
            props.onError?.(err instanceof Error ? err : new Error(String(err)));
        }
    };

    if (submitted) {
        return (
            <div class={`vauth-form-success ${props.className ?? ''}`} role="status">
                {props.successMessage ??
                    "If that email is registered with us, you'll receive a reset link shortly."}
            </div>
        );
    }

    return (
        <form class={`vauth-form vauth-password-reset-request-form ${props.className ?? ''}`} onSubmit={onSubmit} noValidate>
            <label class="vauth-field">
                <span class="vauth-field-label">Email</span>
                <input
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onInput={(e) => setEmail((e.target as HTMLInputElement).value)}
                    disabled={action.loading}
                />
            </label>
            {action.error && <div class="vauth-error" role="alert">{action.error.message}</div>}
            <button
                type="submit"
                class="vauth-btn vauth-btn-primary"
                disabled={action.loading}
                aria-busy={action.loading}
            >
                {action.loading ? 'Sending…' : 'Send reset link'}
            </button>
        </form>
    );
}
