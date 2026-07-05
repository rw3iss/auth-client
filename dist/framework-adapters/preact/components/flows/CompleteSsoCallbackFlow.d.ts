import type { ComponentChildren } from 'preact';
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
export declare function CompleteSsoCallbackFlow(props: CompleteSsoCallbackFlowProps): import("preact").JSX.Element;
//# sourceMappingURL=CompleteSsoCallbackFlow.d.ts.map