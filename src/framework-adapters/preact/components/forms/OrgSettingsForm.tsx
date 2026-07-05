/** @jsxImportSource preact */
import { useEffect, useState } from 'preact/hooks';
import { useGetOrg, useUpdateOrg } from '../../actions.js';
import { useOrg } from '../../hooks.js';
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

export function OrgSettingsForm(props: OrgSettingsFormProps) {
    const activeOrg = useOrg(props.client);
    const load = useGetOrg(props.client);
    const save = useUpdateOrg(props.client);
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const orgId = props.orgId ?? activeOrg?.id;

    useEffect(() => {
        if (!orgId) return;
        void load.run(orgId).then((org) => {
            setName(org.name ?? '');
            setSlug(org.slug ?? '');
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [orgId]);

    const onSubmit = async (e: Event) => {
        e.preventDefault();
        if (!orgId) return;
        await save.run({ orgId, body: { name, slug } });
        setSubmitted(true);
        props.onSaved?.();
    };

    if (!orgId) return <div class="vauth-form-loading">No active organization.</div>;
    if (load.loading && !load.data) return <div class="vauth-form-loading">Loading settings…</div>;

    return (
        <form class={`vauth-form vauth-org-settings-form ${props.className ?? ''}`} onSubmit={onSubmit} noValidate>
            <label class="vauth-field">
                <span class="vauth-field-label">Organization name</span>
                <input
                    type="text"
                    required
                    value={name}
                    onInput={(e) => setName((e.target as HTMLInputElement).value)}
                    disabled={save.loading}
                />
            </label>
            <label class="vauth-field">
                <span class="vauth-field-label">Slug</span>
                <input
                    type="text"
                    required
                    pattern="[a-z0-9-]+"
                    value={slug}
                    onInput={(e) => setSlug((e.target as HTMLInputElement).value)}
                    disabled={save.loading}
                />
                <span class="vauth-field-hint">Lowercase letters, digits, and hyphens. Shows up in URLs.</span>
            </label>
            {save.error && <div class="vauth-error" role="alert">{save.error.message}</div>}
            {submitted && !save.error && <div class="vauth-form-success" role="status">Settings saved.</div>}
            <button
                type="submit"
                class="vauth-btn vauth-btn-primary"
                disabled={save.loading}
                aria-busy={save.loading}
            >
                {save.loading ? 'Saving…' : 'Save changes'}
            </button>
        </form>
    );
}
