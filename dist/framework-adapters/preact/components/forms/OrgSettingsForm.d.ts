import type { AuthClient } from '../../../../core/auth-client.js';
/**
 * Org settings editor — read + edit `name` and `slug`. Fetches the
 * full org record on mount so the form's initial values match what's
 * server-side (the auth-snapshot's `org_name` claim is stamped at
 * token-issue time and may be stale).
 *
 * Requires `org:read` (to load) and `org:update` (to save).
 */
export interface OrgSettingsFormProps {
    client?: AuthClient;
    orgId?: string;
    onSaved?: () => void;
    className?: string;
}
export declare function OrgSettingsForm(props: OrgSettingsFormProps): import("preact").JSX.Element;
//# sourceMappingURL=OrgSettingsForm.d.ts.map