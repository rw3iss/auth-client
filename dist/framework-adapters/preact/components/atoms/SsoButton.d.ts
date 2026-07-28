/** @jsxImportSource preact */
import type { ComponentChildren } from 'preact';
import type { AuthClient } from '../../../../core/auth-client.js';
/**
 * Base "Sign in with X" button. The four named variants below
 * (SignInWithGoogleButton, etc.) are thin wrappers that pre-fill the
 * provider + brand styling. Roll your own variant by passing
 * `provider`, `brandLabel`, and `icon`.
 *
 * On click:
 *   1. Calls AuthClient.startSso({ provider, redirectUrl }) — the SDK
 *      handles PKCE generation, server-side state minting, and the URL
 *      construction.
 *   2. Navigates the browser to `auth_url`. The provider redirects back
 *      to your `redirectUrl` with `?code=...&state=...`; consumers
 *      typically mount <CompleteSsoCallbackFlow> on that route to
 *      complete the exchange.
 *
 * Pass a custom `onStart` to take over the navigation (e.g. open in a
 * popup window instead of full-page redirect).
 */
export interface SsoButtonProps {
    provider: string;
    redirectUrl: string;
    brandLabel: string;
    icon?: ComponentChildren;
    client?: AuthClient;
    organizationId?: string;
    inviteCode?: string;
    /** Custom navigation. Default: window.location.assign(authUrl). */
    onStart?: (authUrl: string) => void;
    /** Called if the start request fails. */
    onError?: (err: Error) => void;
    className?: string;
    /** brand-themed background. "color" matches the provider's brand,
     * "outline" is a neutral border, "dark" is for dark backgrounds. */
    variant?: 'color' | 'outline' | 'dark';
}
export declare function SsoButton(props: SsoButtonProps): import("preact").JSX.Element;
type Variant = Omit<SsoButtonProps, 'provider' | 'brandLabel' | 'icon'>;
export declare const SignInWithGoogleButton: (p: Variant & {
    provider?: string;
    brandLabel?: string;
}) => import("preact").JSX.Element;
export declare const SignInWithAppleButton: (p: Variant & {
    provider?: string;
    brandLabel?: string;
}) => import("preact").JSX.Element;
export declare const SignInWithMicrosoftButton: (p: Variant & {
    provider?: string;
    brandLabel?: string;
}) => import("preact").JSX.Element;
export declare const SignInWithGitHubButton: (p: Variant & {
    provider?: string;
    brandLabel?: string;
}) => import("preact").JSX.Element;
/** "Login with X" (x.com / Twitter). Dark brand to match X's black mark. */
export declare const SignInWithXButton: (p: Variant & {
    provider?: string;
    brandLabel?: string;
}) => import("preact").JSX.Element;
export {};
//# sourceMappingURL=SsoButton.d.ts.map