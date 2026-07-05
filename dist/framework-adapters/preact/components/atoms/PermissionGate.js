import { Fragment as _Fragment, jsx as _jsx } from "preact/jsx-runtime";
import { useAuth } from '../../hooks.js';
export function PermissionGate(props) {
    const snap = useAuth(props.client);
    const perms = snap.claims?.permissions ?? [];
    const roles = snap.claims?.roles ?? [];
    if (roles.includes('system_admin'))
        return _jsx(_Fragment, { children: props.children });
    const allowed = (!props.anyOf || props.anyOf.some((p) => perms.includes(p))) &&
        (!props.allOf || props.allOf.every((p) => perms.includes(p)));
    if (!allowed)
        return _jsx(_Fragment, { children: props.fallback ?? null });
    return _jsx(_Fragment, { children: props.children });
}
//# sourceMappingURL=PermissionGate.js.map