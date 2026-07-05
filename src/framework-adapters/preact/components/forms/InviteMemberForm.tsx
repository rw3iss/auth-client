/** @jsxImportSource preact */
import { useState } from 'preact/hooks';
import { useCreateInvitation } from '../../actions.js';
import { useOrg } from '../../hooks.js';
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

export function InviteMemberForm(props: InviteMemberFormProps) {
    const org = useOrg(props.client);
    const create = useCreateInvitation(props.client);
    const [email, setEmail] = useState('');
    const orgId = props.orgId ?? org?.id;

    const onSubmit = async (e: Event) => {
        e.preventDefault();
        if (!orgId) return;
        try {
            const invitation = await create.run({
                orgId,
                body: {
                    email,
                    ...(props.defaultRoleIds && props.defaultRoleIds.length > 0 && { role_ids: props.defaultRoleIds }),
                },
            });
            setEmail('');
            props.onCreated?.(invitation);
        } catch (err) {
            props.onError?.(err instanceof Error ? err : new Error(String(err)));
        }
    };

    if (!orgId) {
        return <div class="vauth-form-loading">No active organization.</div>;
    }

    return (
        <form class={`vauth-form vauth-invite-form ${props.className ?? ''}`} onSubmit={onSubmit} noValidate>
            <label class="vauth-field">
                <span class="vauth-field-label">Invite by email</span>
                <input
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="teammate@example.com"
                    value={email}
                    onInput={(e) => setEmail((e.target as HTMLInputElement).value)}
                    disabled={create.loading}
                />
                <span class="vauth-field-hint">They'll receive an email with a sign-up link scoped to this org.</span>
            </label>
            {create.error && <div class="vauth-error" role="alert">{create.error.message}</div>}
            {create.data && (
                <div class="vauth-form-success" role="status">Invitation sent to {create.data.email}.</div>
            )}
            <button
                type="submit"
                class="vauth-btn vauth-btn-primary"
                disabled={create.loading || email.trim() === ''}
                aria-busy={create.loading}
            >
                {create.loading ? 'Sending…' : 'Send invitation'}
            </button>
        </form>
    );
}
