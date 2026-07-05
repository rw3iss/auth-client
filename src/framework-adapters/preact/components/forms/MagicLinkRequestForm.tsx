/** @jsxImportSource preact */
import { useState } from 'preact/hooks';
import { useRequestMagicLink } from '../../actions.js';
import type { AuthClient } from '../../../../core/auth-client.js';

/**
 * "Email me a sign-in link" form. Anonymous. Server responds 204
 * regardless of whether the email is registered — anti-enumeration —
 * so the success state just tells the user to check their inbox.
 *
 * Drop next to the LoginForm as an alternative login path. The
 * AuthClient.verifyMagicLink call (on the /auth/magic-link/verify
 * route) completes the round-trip; see CompleteMagicLinkFlow for the
 * paired verifier.
 */
export interface MagicLinkRequestFormProps {
    client?: AuthClient;
    defaultEmail?: string;
    /** Override the success message. */
    successMessage?: string;
    /** App code override. Defaults to the AuthClient's configured one. */
    appCode?: string;
    onSuccess?: () => void;
    onError?: (err: Error) => void;
    className?: string;
}

export function MagicLinkRequestForm(props: MagicLinkRequestFormProps) {
    const action = useRequestMagicLink(props.client);
    const [email, setEmail] = useState(props.defaultEmail ?? '');
    const [submitted, setSubmitted] = useState(false);

    const onSubmit = async (e: Event) => {
        e.preventDefault();
        try {
            await action.run({
                email,
                ...(props.appCode && { appCode: props.appCode }),
            });
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
                    "If that email is registered with us, you'll receive a sign-in link shortly."}
            </div>
        );
    }

    return (
        <form class={`vauth-form vauth-magic-link-form ${props.className ?? ''}`} onSubmit={onSubmit} noValidate>
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
                <span class="vauth-field-hint">We'll email you a one-tap sign-in link. No password required.</span>
            </label>
            {action.error && <div class="vauth-error" role="alert">{action.error.message}</div>}
            <button
                type="submit"
                class="vauth-btn vauth-btn-primary"
                disabled={action.loading || email.trim() === ''}
                aria-busy={action.loading}
            >
                {action.loading ? 'Sending…' : 'Email me a sign-in link'}
            </button>
        </form>
    );
}
