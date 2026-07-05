/** @jsxImportSource preact */
import { useEffect, useState } from 'preact/hooks';
import {
    useGetSessions,
    useTerminateSession,
    useAdminListUserSessions,
    useAdminTerminateUserSession,
} from '../../actions.js';
import type { SessionRecord } from '../../../../core/flows/sessions.flow.js';
import type { AuthClient } from '../../../../core/auth-client.js';

/**
 * Active sessions for either the caller or a target user.
 *
 * Two modes, picked by the `userId` prop:
 *
 *   - **Self-service (default, `userId` omitted)** — calls
 *     `getSessions()` + `terminateSession()`. Lists the caller's
 *     own sessions; the row backing the current call is tagged
 *     `is_current` and rendered with a "this device" pill.
 *     Terminating the current row triggers the SDK's logout-on-401
 *     path automatically.
 *
 *   - **Admin (`userId` set)** — calls
 *     `adminListUserSessions()` + `adminTerminateUserSession()`.
 *     Surfaces another user's sessions for support / IR / kicking
 *     someone out of their other laptop. Caller must hold a
 *     system_admin or super_admin token; the server enforces.
 *     `is_current` is never set in this mode (meaningless when
 *     the caller isn't the session's owner).
 *
 * Same renderer, same row markup — only the data source switches.
 * If you want to render admin vs self-service differently, wrap
 * `<SessionsList>` and override `formatDevice`.
 */
export interface SessionsListProps {
    client?: AuthClient;
    /**
     * When set, the component lists & terminates sessions for the
     * given user via the admin endpoints rather than the caller's
     * own. Requires admin role server-side.
     */
    userId?: string;
    /** Custom row formatter — override to render brand colors per browser, etc. */
    formatDevice?: (s: SessionRecord) => string;
    className?: string;
}

function defaultFormatDevice(s: SessionRecord): string {
    return s.device_info || (s.user_agent ? truncateUA(s.user_agent) : 'Unknown device');
}

function truncateUA(ua: string): string {
    return ua.length > 60 ? `${ua.slice(0, 57)}…` : ua;
}

function formatTimestamp(value: string | number | undefined): string {
    if (!value) return '—';
    // Server emits RFC 3339 strings (e.g. "2026-05-15T17:52:56Z").
    // The `number` branch is kept for backward-compat with earlier
    // SDK callers that may have passed Unix-seconds — those still
    // parse correctly via the `* 1000` path. The Date constructor
    // accepts either an ISO string or a millisecond epoch.
    const date = typeof value === 'number' ? new Date(value * 1000) : new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleString();
}

export function SessionsList(props: SessionsListProps) {
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

    const [items, setItems] = useState<SessionRecord[]>([]);

    useEffect(() => {
        if (!list.isIdle) return;
        if (isAdmin) {
            void adminList.run(props.userId!).then((data) => setItems(data));
        } else {
            void selfList.run().then((data) => setItems(data));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.userId]);

    useEffect(() => {
        if (list.data) setItems(list.data as SessionRecord[]);
    }, [list.data]);

    const onTerminate = async (id: string) => {
        if (isAdmin) {
            await adminTerminate.run({ userId: props.userId!, sessionId: id });
        } else {
            await selfTerminate.run(id);
        }
        setItems((prev) => prev.filter((s) => s.id !== id));
    };

    if (list.loading && items.length === 0) {
        return <div class={`vauth-sessions-loading ${props.className ?? ''}`}>Loading sessions…</div>;
    }
    if (list.error) {
        return <div class={`vauth-error ${props.className ?? ''}`} role="alert">{list.error.message}</div>;
    }
    if (items.length === 0) {
        return <div class={`vauth-sessions-empty ${props.className ?? ''}`}>No active sessions.</div>;
    }

    const formatDevice = props.formatDevice ?? defaultFormatDevice;
    return (
        <table class={`vauth-sessions-table ${props.className ?? ''}`}>
            <thead>
                <tr><th>Device</th><th>IP</th><th>Last active</th><th /></tr>
            </thead>
            <tbody>
                {items.map((s) => (
                    <tr key={s.id} class={s.is_current ? 'vauth-session-current' : ''}>
                        <td>
                            {formatDevice(s)}
                            {s.is_current && <span class="vauth-session-tag">this device</span>}
                        </td>
                        <td><code>{s.ip_address ?? '—'}</code></td>
                        <td>{formatTimestamp(s.last_activity_at)}</td>
                        <td>
                            <button
                                type="button"
                                class="vauth-btn vauth-btn-danger vauth-btn-sm"
                                onClick={() => onTerminate(s.id)}
                                disabled={terminate.loading}
                            >
                                Terminate
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
