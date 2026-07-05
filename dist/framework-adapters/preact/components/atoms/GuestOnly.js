import { Fragment as _Fragment, jsx as _jsx } from "preact/jsx-runtime";
import { useAuth } from '../../hooks.js';
export function GuestOnly(props) {
    const snap = useAuth(props.client);
    // While bootstrap is in flight we can already see status: anonymous
    // when there's no cached token, so optimistically render children
    // for header / nav chrome — the worst case is a sub-second flash if
    // we later resolve to authenticated, which the cross-fade hides.
    // Callers that genuinely need to gate on `ready` should pass an
    // explicit `loading` slot.
    if (!snap.ready && props.loading !== undefined) {
        return _jsx(_Fragment, { children: props.loading });
    }
    if (snap.status === 'authenticated') {
        return _jsx(_Fragment, { children: props.fallback ?? null });
    }
    return _jsx(_Fragment, { children: props.children });
}
//# sourceMappingURL=GuestOnly.js.map