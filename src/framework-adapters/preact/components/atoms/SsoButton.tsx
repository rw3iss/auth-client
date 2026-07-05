/** @jsxImportSource preact */
import type { ComponentChildren } from 'preact';
import { useStartSso } from '../../actions.js';
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

export function SsoButton(props: SsoButtonProps) {
    const startSso = useStartSso(props.client);
    const variant = props.variant ?? 'outline';
    const onClick = async () => {
        try {
            const result = await startSso.run({
                provider: props.provider,
                redirectUrl: props.redirectUrl,
                ...(props.organizationId !== undefined && { organizationId: props.organizationId }),
                ...(props.inviteCode !== undefined && { inviteCode: props.inviteCode }),
            });
            const navigate = props.onStart ?? ((url: string) => {
                if (typeof window !== 'undefined') window.location.assign(url);
            });
            navigate(result.authUrl);
        } catch (err) {
            props.onError?.(err instanceof Error ? err : new Error(String(err)));
        }
    };
    return (
        <button
            type="button"
            class={`vauth-sso-btn vauth-sso-${props.provider} vauth-sso-${variant} ${props.className ?? ''}`}
            onClick={onClick}
            disabled={startSso.loading}
            aria-busy={startSso.loading}
            data-provider={props.provider}
        >
            {props.icon && <span class="vauth-sso-icon" aria-hidden="true">{props.icon}</span>}
            <span class="vauth-sso-label">{startSso.loading ? `Redirecting to ${props.brandLabel}…` : `Continue with ${props.brandLabel}`}</span>
        </button>
    );
}

/* ──────────────────────────────────────────────────────────────────── */
/* Brand variants                                                       */
/* ──────────────────────────────────────────────────────────────────── */

type Variant = Omit<SsoButtonProps, 'provider' | 'brandLabel' | 'icon'>;

const GoogleIcon = (
    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
        <path d="M17.64 9.2c0-.64-.06-1.25-.17-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.71-1.58 2.68-3.9 2.68-6.62z" fill="#4285F4" />
        <path d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.83.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.9v2.32A9 9 0 0 0 9 18z" fill="#34A853" />
        <path d="M3.97 10.72A5.41 5.41 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.96H.9A9 9 0 0 0 0 9c0 1.45.35 2.83.9 4.04l3.07-2.32z" fill="#FBBC05" />
        <path d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .9 4.96l3.07 2.32C4.68 5.16 6.66 3.58 9 3.58z" fill="#EA4335" />
    </svg>
);

export const SignInWithGoogleButton = (p: Variant & { provider?: string; brandLabel?: string }) =>
    SsoButton({ provider: 'google', brandLabel: 'Google', icon: GoogleIcon, ...p });

const AppleIcon = (
    <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
        <path d="M17.6 12.5c0-2.8 2.3-4.2 2.4-4.3-1.3-1.9-3.3-2.2-4-2.2-1.7-.2-3.3 1-4.2 1-.9 0-2.2-1-3.6-1-1.8 0-3.5 1.1-4.5 2.8-1.9 3.3-.5 8.2 1.4 10.9.9 1.3 2 2.8 3.4 2.7 1.4-.1 1.9-.9 3.6-.9s2.2.9 3.6.9 2.4-1.3 3.3-2.7c1-1.5 1.5-3 1.5-3.1-.1 0-2.9-1.1-2.9-4.1zM14.9 4.1c.8-1 1.3-2.3 1.2-3.6-1.1.1-2.5.8-3.3 1.7-.7.9-1.4 2.2-1.2 3.5 1.2.1 2.4-.6 3.3-1.6z" />
    </svg>
);

export const SignInWithAppleButton = (p: Variant & { provider?: string; brandLabel?: string }) =>
    SsoButton({ provider: 'apple', brandLabel: 'Apple', icon: AppleIcon, variant: 'dark', ...p });

const MicrosoftIcon = (
    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
        <rect x="1" y="1" width="7.4" height="7.4" fill="#F25022" />
        <rect x="9.6" y="1" width="7.4" height="7.4" fill="#7FBA00" />
        <rect x="1" y="9.6" width="7.4" height="7.4" fill="#00A4EF" />
        <rect x="9.6" y="9.6" width="7.4" height="7.4" fill="#FFB900" />
    </svg>
);

export const SignInWithMicrosoftButton = (p: Variant & { provider?: string; brandLabel?: string }) =>
    SsoButton({ provider: 'microsoft', brandLabel: 'Microsoft', icon: MicrosoftIcon, ...p });

const GitHubIcon = (
    <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
        <path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.9 1.3 1.9 1.3 1.1 1.9 2.9 1.3 3.6 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-6 0-1.3.5-2.3 1.3-3.2-.1-.4-.6-1.6.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17.3 4.7 18.3 5 18.3 5c.7 1.6.2 2.8.1 3.2.8.9 1.3 2 1.3 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3" />
    </svg>
);

export const SignInWithGitHubButton = (p: Variant & { provider?: string; brandLabel?: string }) =>
    SsoButton({ provider: 'github', brandLabel: 'GitHub', icon: GitHubIcon, variant: 'dark', ...p });
