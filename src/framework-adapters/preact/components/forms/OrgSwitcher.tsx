/** @jsxImportSource preact */
import { useEffect, useState } from 'preact/hooks';
import { useGetMyOrgs, useSwitchOrg } from '../../actions.js';
import { useAuth } from '../../hooks.js';
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

export function OrgSwitcher(props: OrgSwitcherProps) {
    const snap = useAuth(props.client);
    const list = useGetMyOrgs(props.client);
    const switchOrg = useSwitchOrg(props.client);
    const [orgs, setOrgs] = useState<MyOrgRecord[]>([]);
    const currentOrgId = snap.claims?.org_id;

    useEffect(() => {
        if (snap.status !== 'authenticated') return;
        if (list.isIdle) {
            void list.run().then((data) => setOrgs(data));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [snap.status]);

    const onChange = async (e: Event) => {
        const target = e.target as HTMLSelectElement;
        const orgId = target.value;
        const org = orgs.find((o) => o.id === orgId);
        if (!org || org.id === currentOrgId) return;
        try {
            await switchOrg.run(orgId);
            props.onSwitch?.(org);
        } catch (err) {
            props.onError?.(err instanceof Error ? err : new Error(String(err)));
        }
    };

    if (snap.status !== 'authenticated') return null;
    if (orgs.length === 0 && !list.loading) return null;

    return (
        <label class={`vauth-org-switcher ${props.className ?? ''}`}>
            <span class="vauth-field-label">Organization</span>
            <select
                value={currentOrgId ?? ''}
                onChange={onChange}
                disabled={switchOrg.loading || list.loading}
                aria-busy={switchOrg.loading}
            >
                {orgs.map((o) => (
                    <option key={o.id} value={o.id}>{o.name}</option>
                ))}
            </select>
            {switchOrg.error && <span class="vauth-error" role="alert">{switchOrg.error.message}</span>}
        </label>
    );
}
