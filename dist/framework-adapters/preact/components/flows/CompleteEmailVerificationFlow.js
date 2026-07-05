import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "preact/jsx-runtime";
/** @jsxImportSource preact */
import { useEffect, useRef, useState } from 'preact/hooks';
import { useVerifyEmail } from '../../actions.js';
export function CompleteEmailVerificationFlow(props) {
    const verify = useVerifyEmail(props.client);
    const [state, setState] = useState('verifying');
    const [error, setError] = useState(null);
    const fired = useRef(false);
    useEffect(() => {
        // Verification tokens are single-use — never re-run (StrictMode,
        // prop identity changes, etc. must not consume the token twice).
        if (fired.current)
            return;
        fired.current = true;
        const token = props.token ??
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
            .catch((err) => {
            setError(err);
            setState('error');
            props.onError?.(err);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const continueLink = props.continueHref && (_jsx("p", { class: "vauth-flow-footer", children: _jsx("a", { href: props.continueHref, children: props.continueLabel ?? 'Continue to sign in' }) }));
    return (_jsxs("div", { class: `vauth-flow vauth-flow-verify-email ${props.className ?? ''}`, "data-state": state, children: [state === 'verifying' &&
                (props.loadingSlot ?? (_jsxs("header", { class: "vauth-flow-header", children: [_jsx("h1", { children: "Verifying your email\u2026" }), _jsx("p", { class: "vauth-flow-sub", role: "status", children: "One moment while we confirm your address." })] }))), state === 'success' && (_jsxs(_Fragment, { children: [_jsxs("header", { class: "vauth-flow-header", children: [_jsx("h1", { children: "Email verified" }), _jsx("p", { class: "vauth-flow-sub", role: "status", children: "Your address is confirmed \u2014 your account is ready." })] }), continueLink] })), state === 'error' &&
                (props.renderError && error ? (props.renderError(error)) : (_jsxs(_Fragment, { children: [_jsx("header", { class: "vauth-flow-header", children: _jsx("h1", { children: "Verification failed" }) }), _jsx("div", { class: "vauth-error", role: "alert", children: error?.message ?? 'This verification link is invalid or has expired.' }), continueLink] }))), state === 'missing' && (_jsxs(_Fragment, { children: [_jsxs("header", { class: "vauth-flow-header", children: [_jsx("h1", { children: "Missing verification token" }), _jsx("p", { class: "vauth-flow-sub", children: "This link looks incomplete \u2014 try the link from your email again." })] }), continueLink] }))] }));
}
//# sourceMappingURL=CompleteEmailVerificationFlow.js.map