import { Fragment as _Fragment, jsx as _jsx } from "preact/jsx-runtime";
import { useAuth } from '../../hooks.js';
export function ProtectedRoute(props) {
    const snap = useAuth(props.client);
    // Only render an explicit `loading` slot during the pre-ready
    // window. Without one we render nothing — header / nav chrome
    // doesn't want a "Loading…" placeholder leaking through. Page-level
    // routes that need a spinner should pass `loading={<Spinner/>}`.
    if (!snap.ready && props.loading !== undefined) {
        return _jsx(_Fragment, { children: props.loading });
    }
    if (snap.status !== 'authenticated') {
        return _jsx(_Fragment, { children: props.fallback ?? null });
    }
    return _jsx(_Fragment, { children: props.children });
}
//# sourceMappingURL=ProtectedRoute.js.map