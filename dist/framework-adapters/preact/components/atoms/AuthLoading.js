import { jsx as _jsx, Fragment as _Fragment } from "preact/jsx-runtime";
import { useAuthReady } from '../../hooks.js';
export function AuthLoading(props) {
    const ready = useAuthReady(props.client);
    if (!ready) {
        return _jsx(_Fragment, { children: props.fallback ?? _jsx(DefaultSpinner, {}) });
    }
    return _jsx(_Fragment, { children: props.children });
}
function DefaultSpinner() {
    return (_jsx("div", { class: "vauth-loading-spinner", role: "status", "aria-label": "Loading", children: _jsx("svg", { width: "32", height: "32", viewBox: "0 0 32 32", xmlns: "http://www.w3.org/2000/svg", children: _jsx("circle", { cx: "16", cy: "16", r: "13", fill: "none", stroke: "currentColor", "stroke-width": "3", "stroke-dasharray": "60 30", "stroke-linecap": "round", children: _jsx("animateTransform", { attributeName: "transform", type: "rotate", from: "0 16 16", to: "360 16 16", dur: "1s", repeatCount: "indefinite" }) }) }) }));
}
//# sourceMappingURL=AuthLoading.js.map