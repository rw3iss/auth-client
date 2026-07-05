import type { MyOrgRecord } from '../../../../core/types.js';
import type { AuthClient } from '../../../../core/auth-client.js';
/**
 * Dropdown of the user's organization memberships with a click-to-switch
 * action. Switching calls `AuthClient.switchOrg(orgId)` which:
 *   1. Refreshes the access token with the new `organization_id`.
 *   2. Emits the `org_switched` event for subscribers.
 *   3. Updates the auth snapshot's claims so consumers gating UI on
 *      `claims.org_id` react automatically.
 *
 * The current org is read from the claims; the dropdown highlights it.
 * Membership is verified server-side every switch, so a stale
 * `MyOrgRecord` from `getMyOrgs()` won't grant unauthorized access.
 */
export interface OrgSwitcherProps {
    client?: AuthClient;
    onSwitch?: (org: MyOrgRecord) => void;
    onError?: (err: Error) => void;
    className?: string;
}
export declare function OrgSwitcher(props: OrgSwitcherProps): import("preact").JSX.Element | null;
//# sourceMappingURL=OrgSwitcher.d.ts.map