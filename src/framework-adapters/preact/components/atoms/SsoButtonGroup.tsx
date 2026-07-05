/** @jsxImportSource preact */
import {
    SignInWithGoogleButton,
    SignInWithAppleButton,
    SignInWithMicrosoftButton,
    SignInWithGitHubButton,
} from './SsoButton.js';
import type { AuthClient } from '../../../../core/auth-client.js';

/**
 * Pre-arranged vertical stack of the four built-in SSO buttons. Pass
 * `providers` to filter or reorder. Useful as a single drop-in for
 * login pages; render the individual brand buttons directly for more
 * control over layout.
 */
export type SsoProviderName = 'google' | 'apple' | 'microsoft' | 'github';

export interface SsoButtonGroupProps {
    redirectUrl: string;
    /** Which providers to render, in order. Default: all four. */
    providers?: SsoProviderName[];
    /**
     * If set, only providers whose names appear here render. Plus
     * 'password' is filtered out (it's a no-op for an SSO group).
     * Wire from `useAppPolicy().policy.allowed_auth_methods` so the
     * group respects per-app policy automatically.
     */
    allowedAuthMethods?: string[];
    client?: AuthClient;
    organizationId?: string;
    inviteCode?: string;
    onError?: (err: Error) => void;
    className?: string;
}

const RENDERERS: Record<SsoProviderName, (p: any) => preact.JSX.Element> = {
    google: SignInWithGoogleButton,
    apple: SignInWithAppleButton,
    microsoft: SignInWithMicrosoftButton,
    github: SignInWithGitHubButton,
};

export function SsoButtonGroup(props: SsoButtonGroupProps) {
    let providers = props.providers ?? ['google', 'apple', 'microsoft', 'github'];
    if (props.allowedAuthMethods && props.allowedAuthMethods.length > 0) {
        const allow = new Set(props.allowedAuthMethods.map((m) => m.toLowerCase()));
        providers = providers.filter((p) => allow.has(p));
    }
    // Drop any name without a brand renderer (e.g. an unrecognized
    // provider from the server) so the map below never hits `undefined`.
    providers = providers.filter((p) => RENDERERS[p]);
    if (providers.length === 0) return null;
    return (
        <div class={`vauth-sso-group ${props.className ?? ''}`}>
            {providers.map((p) => {
                const Render = RENDERERS[p];
                const childProps: Record<string, unknown> = {
                    redirectUrl: props.redirectUrl,
                };
                if (props.client !== undefined) childProps.client = props.client;
                if (props.organizationId !== undefined) childProps.organizationId = props.organizationId;
                if (props.inviteCode !== undefined) childProps.inviteCode = props.inviteCode;
                if (props.onError !== undefined) childProps.onError = props.onError;
                return <Render key={p} {...childProps} />;
            })}
        </div>
    );
}
