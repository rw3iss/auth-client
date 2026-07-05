/** @jsxImportSource preact */
import { useEffect, useState } from 'preact/hooks';
import type { ComponentChildren } from 'preact';
import { useCompleteSso } from '../../actions.js';
import type { AuthClient } from '../../../../core/auth-client.js';
import type { AuthResponse } from '../../../../core/types.js';

/**
 * SSO callback handler — mount on your `redirectUrl` route (the same
 * URL passed to `startSso`). Reads `code` and `state` from the URL
 * search params and exchanges them for tokens via /auth/sso/callback.
 *
 * Behavior:
 *   - Loading → renders the `loadingSlot` (default spinner).
 *   - Success → calls `onSuccess(resp)` so the consumer can navigate
 *     away (typically to the post-login destination).
 *   - Error → renders `errorSlot` with the message.
 *
 * Works for both PKCE and non-PKCE flows; the SDK handles the
 * conditional auth_code → /auth/sso/exchange step internally.
 */
export interface CompleteSsoCallbackFlowProps {
    client?: AuthClient;
    onSuccess?: (resp: AuthResponse) => void;
    onError?: (err: Error) => void;
    loadingSlot?: ComponentChildren;
    /** Override the error display. Default: inline alert. */
    renderError?: (err: Error) => ComponentChildren;
    className?: string;
}

export function CompleteSsoCallbackFlow(props: CompleteSsoCallbackFlowProps) {
    const complete = useCompleteSso(props.client);
    const [done, setDone] = useState(false);

    useEffect(() => {
        const url = typeof window !== 'undefined' ? new URL(window.location.href) : null;
        const code = url?.searchParams.get('code');
        const state = url?.searchParams.get('state');
        const provider = url?.searchParams.get('provider') ?? undefined;
        if (!code || !state) return;
        void complete
            .run({
                code,
                state,
                ...(provider !== undefined && { provider }),
            })
            .then((resp) => {
                setDone(true);
                props.onSuccess?.(resp);
            })
            .catch((err: unknown) => {
                const e = err instanceof Error ? err : new Error(String(err));
                props.onError?.(e);
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (complete.error) {
        const e = complete.error;
        return (
            <div class={`vauth-flow vauth-flow-sso-callback ${props.className ?? ''}`}>
                {props.renderError ? props.renderError(e) : (
                    <div class="vauth-error" role="alert">
                        Sign-in failed: {e.message}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div class={`vauth-flow vauth-flow-sso-callback ${props.className ?? ''}`}>
            {!done && (props.loadingSlot ?? <div class="vauth-loading">Completing sign-in…</div>)}
        </div>
    );
}
