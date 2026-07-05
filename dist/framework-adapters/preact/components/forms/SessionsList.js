import { jsx as _jsx, jsxs as _jsxs } from "preact/jsx-runtime";
/** @jsxImportSource preact */
import { useEffect, useState } from 'preact/hooks';
import { useGetSessions, useTerminateSession, useAdminListUserSessions, useAdminTerminateUserSession, } from '../../actions.js';
function defaultFormatDevice(s) {
    return s.device_info || (s.user_agent ? truncateUA(s.user_agent) : 'Unknown device');
}
function truncateUA(ua) {
    return ua.length > 60 ? `${ua.slice(0, 57)}…` : ua;
}
function formatTimestamp(value) {
    if (!value)
        return '—';
    // Server emits RFC 3339 strings (e.g. "2026-05-15T17:52:56Z").
    // The `number` branch is kept for backward-compat with earlier
    // SDK callers that may have passed Unix-seconds — those still
    // parse correctly via the `* 1000` path. The Date constructor
    // accepts either an ISO string or a millisecond epoch.
    const date = typeof value === 'number' ? new Date(value * 1000) : new Date(value);
    if (Number.isNaN(date.getTime()))
        return '—';
    return date.toLocaleString();
}
export function SessionsList(props) {
    const isAdmin = props.userId !== undefined;
    // Self-service hooks
    const selfList = useGetSessions(props.client);
    const selfTerminate = useTerminateSession(props.client);
    // Admin hooks
    const adminList = useAdminListUserSessions(props.client);
    const adminTerminate = useAdminTerminateUserSession(props.client);
    // Pick the active pair based on mode. Both pairs share the
    // same Action shape so the render logic below is identical.
    const list = isAdmin ? adminList : selfList;
    const terminate = isAdmin ? adminTerminate : selfTerminate;
    const [items, setItems] = useState([]);
    useEffect(() => {
        if (!list.isIdle)
            return;
        if (isAdmin) {
            void adminList.run(props.userId).then((data) => setItems(data));
        }
        else {
            void selfList.run().then((data) => setItems(data));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.userId]);
    useEffect(() => {
        if (list.data)
            setItems(list.data);
    }, [list.data]);
    const onTerminate = async (id) => {
        if (isAdmin) {
            await adminTerminate.run({ userId: props.userId, sessionId: id });
        }
        else {
            await selfTerminate.run(id);
        }
        setItems((prev) => prev.filter((s) => s.id !== id));
    };
    if (list.loading && items.length === 0) {
        return _jsx("div", { class: `vauth-sessions-loading ${props.className ?? ''}`, children: "Loading sessions\u2026" });
    }
    if (list.error) {
        return _jsx("div", { class: `vauth-error ${props.className ?? ''}`, role: "alert", children: list.error.message });
    }
    if (items.length === 0) {
        return _jsx("div", { class: `vauth-sessions-empty ${props.className ?? ''}`, children: "No active sessions." });
    }
    const formatDevice = props.formatDevice ?? defaultFormatDevice;
    return (_jsxs("table", { class: `vauth-sessions-table ${props.className ?? ''}`, children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Device" }), _jsx("th", { children: "IP" }), _jsx("th", { children: "Last active" }), _jsx("th", {})] }) }), _jsx("tbody", { children: items.map((s) => (_jsxs("tr", { class: s.is_current ? 'vauth-session-current' : '', children: [_jsxs("td", { children: [formatDevice(s), s.is_current && _jsx("span", { class: "vauth-session-tag", children: "this device" })] }), _jsx("td", { children: _jsx("code", { children: s.ip_address ?? '—' }) }), _jsx("td", { children: formatTimestamp(s.last_activity_at) }), _jsx("td", { children: _jsx("button", { type: "button", class: "vauth-btn vauth-btn-danger vauth-btn-sm", onClick: () => onTerminate(s.id), disabled: terminate.loading, children: "Terminate" }) })] }, s.id))) })] }));
}
//# sourceMappingURL=SessionsList.js.map