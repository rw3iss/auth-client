import { Fragment as _Fragment, jsx as _jsx } from "preact/jsx-runtime";
import { useAuth } from '../../hooks.js';
export function RoleGate(props) {
    const snap = useAuth(props.client);
    const roles = snap.claims?.roles ?? [];
    if (roles.includes('system_admin'))
        return _jsx(_Fragment, { children: props.children });
    const allowed = (!props.anyOf || props.anyOf.some((r) => roles.includes(r))) &&
        (!props.allOf || props.allOf.every((r) => roles.includes(r)));
    if (!allowed)
        return _jsx(_Fragment, { children: props.fallback ?? null });
    return _jsx(_Fragment, { children: props.children });
}
//# sourceMappingURL=RoleGate.js.map