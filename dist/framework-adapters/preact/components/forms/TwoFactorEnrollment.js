import { jsx as _jsx, jsxs as _jsxs } from "preact/jsx-runtime";
/** @jsxImportSource preact */
import { useEffect, useState } from 'preact/hooks';
import { useSetupTwoFactor, useEnableTwoFactor } from '../../actions.js';
function defaultQr(uri) {
    const src = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(uri)}`;
    return _jsx("img", { src: src, width: "180", height: "180", alt: "Scan with your authenticator app" });
}
export function TwoFactorEnrollment(props) {
    const setup = useSetupTwoFactor(props.client);
    const enable = useEnableTwoFactor(props.client);
    const [code, setCode] = useState('');
    const [completed, setCompleted] = useState(false);
    // Auto-start setup on mount — most users land on this page to set
    // up 2FA right then. Skip if already enrolling (e.g. re-mount).
    useEffect(() => {
        if (setup.isIdle && !setup.loading && !setup.data) {
            void setup.run();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const onConfirm = async (e) => {
        e.preventDefault();
        await enable.run(code);
        setCompleted(true);
        props.onComplete?.();
    };
    if (completed) {
        return (_jsx("div", { class: `vauth-form-success ${props.className ?? ''}`, role: "status", children: "Two-factor authentication enabled. You'll be asked for a code at next sign-in." }));
    }
    if (setup.loading || !setup.data) {
        return _jsx("div", { class: `vauth-form-loading ${props.className ?? ''}`, children: "Generating secret\u2026" });
    }
    const { secret, provisioningUri } = setup.data;
    const renderQr = props.renderQr ?? defaultQr;
    return (_jsx("div", { class: `vauth-form vauth-2fa-enroll ${props.className ?? ''}`, children: _jsxs("ol", { class: "vauth-2fa-steps", children: [_jsxs("li", { children: [_jsx("h4", { children: "1. Scan with your authenticator app" }), _jsx("div", { class: "vauth-2fa-qr", children: renderQr(provisioningUri) }), _jsxs("details", { children: [_jsx("summary", { children: "Can't scan? Enter this code manually" }), _jsx("pre", { class: "vauth-2fa-secret", children: secret })] })] }), _jsxs("li", { children: [_jsx("h4", { children: "2. Enter the 6-digit code your app shows" }), _jsxs("form", { onSubmit: onConfirm, children: [_jsx("input", { class: "vauth-input vauth-2fa-code-input", type: "text", inputMode: "numeric", pattern: "[0-9]*", maxLength: 6, autoComplete: "one-time-code", value: code, onInput: (e) => setCode(e.target.value), disabled: enable.loading, required: true, autoFocus: true }), enable.error && _jsx("div", { class: "vauth-error", role: "alert", children: enable.error.message }), _jsx("button", { type: "submit", class: "vauth-btn vauth-btn-primary", disabled: enable.loading || code.length !== 6, "aria-busy": enable.loading, children: enable.loading ? 'Verifying…' : 'Confirm and enable' })] })] })] }) }));
}
//# sourceMappingURL=TwoFactorEnrollment.js.map