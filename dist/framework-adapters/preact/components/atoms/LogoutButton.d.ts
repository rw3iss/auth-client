import type { AuthClient } from '../../../../core/auth-client.js';
/**
 * Single-shot logout button. Calls AuthClient.logoutCurrent() and
 * surfaces in-flight + error state from the underlying action hook.
 * Disabled while pending to prevent double-submits.
 */
export interface LogoutButtonProps {
    client?: AuthClient;
    /** Override the button label. Default "Sign out". */
    label?: string;
    /** Called after a successful logout. */
    onComplete?: () => void;
    /** Extra className. */
    className?: string;
    /** style variant — "primary" | "ghost" | "danger". Default "ghost". */
    variant?: 'primary' | 'ghost' | 'danger';
}
export declare function LogoutButton(props: LogoutButtonProps): import("preact").JSX.Element;
//# sourceMappingURL=LogoutButton.d.ts.map