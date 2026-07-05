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
export declare function MagicLinkRequestForm(props: MagicLinkRequestFormProps): import("preact").JSX.Element;
//# sourceMappingURL=MagicLinkRequestForm.d.ts.map