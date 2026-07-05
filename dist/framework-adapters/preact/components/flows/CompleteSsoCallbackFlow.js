import { jsxs as _jsxs, jsx as _jsx } from "preact/jsx-runtime";
/** @jsxImportSource preact */
import { useEffect, useState } from 'preact/hooks';
import { useCompleteSso } from '../../actions.js';
export function CompleteSsoCallbackFlow(props) {
    const complete = useCompleteSso(props.client);
    const [done, setDone] = useState(false);
    useEffect(() => {
        const url = typeof window !== 'undefined' ? new URL(window.location.href) : null;
        const code = url?.searchParams.get('code');
        const state = url?.searchParams.get('state');
        const provider = url?.searchParams.get('provider') ?? undefined;
        if (!code || !state)
            return;
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
            .catch((err) => {
            const e = err instanceof Error ? err : new Error(String(err));
            props.onError?.(e);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    if (complete.error) {
        const e = complete.error;
        return (_jsx("div", { class: `vauth-flow vauth-flow-sso-callback ${props.className ?? ''}`, children: props.renderError ? props.renderError(e) : (_jsxs("div", { class: "vauth-error", role: "alert", children: ["Sign-in failed: ", e.message] })) }));
    }
    return (_jsx("div", { class: `vauth-flow vauth-flow-sso-callback ${props.className ?? ''}`, children: !done && (props.loadingSlot ?? _jsx("div", { class: "vauth-loading", children: "Completing sign-in\u2026" })) }));
}
//# sourceMappingURL=CompleteSsoCallbackFlow.js.map