import type { AuthClient } from '../../../../core/auth-client.js';
import type { InvitationRecord } from '../../../../core/flows/org.flow.js';
/**
 * Invite-by-email form for the current (or specified) org. POSTs
 * `/orgs/{orgId}/invitations` — the server creates the invitation
 * row AND sends the invite email synchronously. On success the
 * created InvitationRecord is handed to `onCreated` so a parent
 * page can refresh its pending-invitations list.
 *
 * Requires `org:members:invite`. The server's 403 surfaces as an
 * inline error.
 */
export interface InviteMemberFormProps {
    client?: AuthClient;
    /** Defaults to the active org id from the auth snapshot. */
    orgId?: string;
    /** Pre-select role ids to assign on acceptance. */
    defaultRoleIds?: string[];
    onCreated?: (invitation: InvitationRecord) => void;
    onError?: (err: Error) => void;
    className?: string;
}
export declare function InviteMemberForm(props: InviteMemberFormProps): import("preact").JSX.Element;
//# sourceMappingURL=InviteMemberForm.d.ts.map