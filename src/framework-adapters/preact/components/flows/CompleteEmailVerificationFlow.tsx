/** @jsxImportSource preact */
import { useEffect, useRef, useState } from 'preact/hooks';
import type { ComponentChildren } from 'preact';
import { useVerifyEmail } from '../../actions.js';
import type { AuthClient } from '../../../../core/auth-client.js';

/**
 * Email-verification landing — mount on the route your verification
 * emails link to (the server builds `{appFrontendURL}/auth/verify-email
 * ?token=...` from the app's `frontend_url`). Reads the token from the
 * URL (or the `token` prop), exchanges it via /auth/verify-email on
 * mount, and renders one of four states:
 *
 *   - verifying → `loadingSlot` (default: quiet status line)
 *   - success   → confirmation + optional `continueHref` link
 *   - error     → `renderError` override or inline alert
 *   - missing   → no token in the URL (bad / truncated link)
 *
 * Stateless about navigation: pass `onSuccess` to redirect, or let the
 * user click through via `continueHref`.
 */
export interface CompleteEmailVerificationFlowProps {
    client?: AuthClient;
    /** Verification token. Default: `?token=` from the current URL. */
    token?: string;
    /** Called once after a successful verification. */
    onSuccess?: () => void;
    onError?: (err: Error) => void;
    /** Where the success (and missing-token) states link to, e.g. "/sign-in". */
    continueHref?: string;
    /** Label for the continue link. Default "Continue to sign in". */
    continueLabel?: string;
    /** Override the in-flight display. Default: quiet status line. */
    loadingSlot?: ComponentChildren;
    /** Override the error display. Default: inline alert + continue link. */
    renderError?: (err: Error) => ComponentChildren;
    className?: string;
}

type FlowState = 'verifying' | 'success' | 'error' | 'missing';

export function CompleteEmailVerificationFlow(props: CompleteEmailVerificationFlowProps) {
    const verify = useVerifyEmail(props.client);
    const [state, setState] = useState<FlowState>('verifying');
    const [error, setError] = useState<Error | null>(null);
    const fired = useRef(false);

    useEffect(() => {
        // Verification tokens are single-use — never re-run (StrictMode,
        // prop identity changes, etc. must not consume the token twice).
        if (fired.current) return;
        fired.current = true;
        const token =
            props.token ??
            (typeof window !== 'undefined'
                ? (new URL(window.location.href).searchParams.get('token') ?? undefined)
                : undefined);
        if (!token) {
            setState('missing');
            return;
        }
        void verify
            .run(token)
            .then(() => {
                setState('success');
                props.onSuccess?.();
            })
            .catch((err: Error) => {
                setError(err);
                setState('error');
                props.onError?.(err);
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const continueLink = props.continueHref && (
        <p class="vauth-flow-footer">
            <a href={props.continueHref}>{props.continueLabel ?? 'Continue to sign in'}</a>
        </p>
    );

    return (
        <div class={`vauth-flow vauth-flow-verify-email ${props.className ?? ''}`} data-state={state}>
            {state === 'verifying' &&
                (props.loadingSlot ?? (
                    <header class="vauth-flow-header">
                        <h1>Verifying your email…</h1>
                        <p class="vauth-flow-sub" role="status">
                            One moment while we confirm your address.
                        </p>
                    </header>
                ))}

            {state === 'success' && (
                <>
                    <header class="vauth-flow-header">
                        <h1>Email verified</h1>
                        <p class="vauth-flow-sub" role="status">
                            Your address is confirmed — your account is ready.
                        </p>
                    </header>
                    {continueLink}
                </>
            )}

            {state === 'error' &&
                (props.renderError && error ? (
                    props.renderError(error)
                ) : (
                    <>
                        <header class="vauth-flow-header">
                            <h1>Verification failed</h1>
                        </header>
                        <div class="vauth-error" role="alert">
                            {error?.message ?? 'This verification link is invalid or has expired.'}
                        </div>
                        {continueLink}
                    </>
                ))}

            {state === 'missing' && (
                <>
                    <header class="vauth-flow-header">
                        <h1>Missing verification token</h1>
                        <p class="vauth-flow-sub">
                            This link looks incomplete — try the link from your email again.
                        </p>
                    </header>
                    {continueLink}
                </>
            )}
        </div>
    );
}
