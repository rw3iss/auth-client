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
export declare function SessionsList(props: SessionsListProps): import("preact").JSX.Element;
//# sourceMappingURL=SessionsList.d.ts.map