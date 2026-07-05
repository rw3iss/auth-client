import { jsx as _jsx } from "preact/jsx-runtime";
/** @jsxImportSource preact */
import { SignInWithGoogleButton, SignInWithAppleButton, SignInWithMicrosoftButton, SignInWithGitHubButton, } from './SsoButton.js';
const RENDERERS = {
    google: SignInWithGoogleButton,
    apple: SignInWithAppleButton,
    microsoft: SignInWithMicrosoftButton,
    github: SignInWithGitHubButton,
};
export function SsoButtonGroup(props) {
    let providers = props.providers ?? ['google', 'apple', 'microsoft', 'github'];
    if (props.allowedAuthMethods && props.allowedAuthMethods.length > 0) {
        const allow = new Set(props.allowedAuthMethods.map((m) => m.toLowerCase()));
        providers = providers.filter((p) => allow.has(p));
    }
    // Drop any name without a brand renderer (e.g. an unrecognized
    // provider from the server) so the map below never hits `undefined`.
    providers = providers.filter((p) => RENDERERS[p]);
    if (providers.length === 0)
        return null;
    return (_jsx("div", { class: `vauth-sso-group ${props.className ?? ''}`, children: providers.map((p) => {
            const Render = RENDERERS[p];
            const childProps = {
                redirectUrl: props.redirectUrl,
            };
            if (props.client !== undefined)
                childProps.client = props.client;
            if (props.organizationId !== undefined)
                childProps.organizationId = props.organizationId;
            if (props.inviteCode !== undefined)
                childProps.inviteCode = props.inviteCode;
            if (props.onError !== undefined)
                childProps.onError = props.onError;
            return _jsx(Render, { ...childProps }, p);
        }) }));
}
//# sourceMappingURL=SsoButtonGroup.js.map