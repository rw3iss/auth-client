/** @jsxImportSource preact */
import { useState } from 'preact/hooks';
import { OrgSettingsForm } from '../forms/OrgSettingsForm.js';
import { MembersList } from '../forms/MembersList.js';
import { InviteMemberForm } from '../forms/InviteMemberForm.js';
import { InvitationsAdminList } from '../forms/InvitationsAdminList.js';
import { OrgRoleEditor } from '../forms/OrgRoleEditor.js';
import { useOrg } from '../../hooks.js';
import type { AuthClient } from '../../../../core/auth-client.js';

/**
 * One-page org administration surface. Composes:
 *   - OrgSettingsForm (name / slug)
 *   - InviteMemberForm + InvitationsAdminList (pending invites)
 *   - MembersList (current members)
 *   - OrgRoleEditor (custom roles + permission picker)
 *
 * Use under /settings/organization. Requires the caller's active
 * org context — read from `useOrg()` — and the relevant `org:*`
 * permissions for each section (each child gates server-side).
 *
 * Invite + pending-list are wired so a successful invite re-fetches
 * the pending list automatically (via the `refreshKey` prop on
 * InvitationsAdminList).
 */
export interface CompleteOrgAdminFlowProps {
    client?: AuthClient;
    orgId?: string;
    className?: string;
}

export function CompleteOrgAdminFlow(props: CompleteOrgAdminFlowProps) {
    const org = useOrg(props.client);
    const orgId = props.orgId ?? org?.id;
    const [inviteTick, setInviteTick] = useState(0);

    if (!orgId) {
        return (
            <div class={`vauth-flow vauth-flow-org-admin-empty ${props.className ?? ''}`}>
                <header class="vauth-flow-header">
                    <h1>Organization administration</h1>
                </header>
                <p class="vauth-flow-text">No active organization. Switch to one first.</p>
            </div>
        );
    }

    return (
        <div class={`vauth-flow vauth-flow-org-admin ${props.className ?? ''}`}>
            <header class="vauth-flow-header">
                <h1>Organization administration</h1>
                <p class="vauth-flow-sub">Manage settings, members, invitations, and roles.</p>
            </header>

            <section class="vauth-section">
                <h2>Settings</h2>
                <OrgSettingsForm
                    {...(props.client !== undefined && { client: props.client })}
                    orgId={orgId}
                />
            </section>

            <section class="vauth-section">
                <h2>Members</h2>
                <MembersList
                    {...(props.client !== undefined && { client: props.client })}
                    orgId={orgId}
                />
            </section>

            <section class="vauth-section">
                <h2>Invitations</h2>
                <InviteMemberForm
                    {...(props.client !== undefined && { client: props.client })}
                    orgId={orgId}
                    onCreated={() => setInviteTick((t) => t + 1)}
                />
                <div class="vauth-section-footer">
                    <InvitationsAdminList
                        {...(props.client !== undefined && { client: props.client })}
                        orgId={orgId}
                        refreshKey={inviteTick}
                    />
                </div>
            </section>

            <section class="vauth-section">
                <h2>Roles</h2>
                <OrgRoleEditor
                    {...(props.client !== undefined && { client: props.client })}
                    orgId={orgId}
                />
            </section>
        </div>
    );
}
