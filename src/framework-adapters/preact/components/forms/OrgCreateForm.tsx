/** @jsxImportSource preact */
import { useState } from 'preact/hooks';
import { useCreateOrg } from '../../actions.js';
import type { Organization } from '../../../../core/types.js';
import type { AuthClient } from '../../../../core/auth-client.js';

/**
 * Admin-only org creation. POSTs `/admin/organizations`. On success
 * the new Organization is handed to `onCreated` so the parent can
 * navigate / select it / refresh a list.
 *
 * For tenant-driven self-service org creation (a user creating their
 * own org during onboarding), wire your own variant — the underlying
 * SDK call is the same; only the gating differs.
 */
export interface OrgCreateFormProps {
    client?: AuthClient;
    onCreated?: (org: Organization) => void;
    onError?: (err: Error) => void;
    className?: string;
}

export function OrgCreateForm(props: OrgCreateFormProps) {
    const create = useCreateOrg(props.client);
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');

    const onSubmit = async (e: Event) => {
        e.preventDefault();
        try {
            const org = await create.run({ name, ...(slug && { slug }) });
            props.onCreated?.(org);
            setName('');
            setSlug('');
        } catch (err) {
            props.onError?.(err instanceof Error ? err : new Error(String(err)));
        }
    };

    return (
        <form class={`vauth-form vauth-org-create-form ${props.className ?? ''}`} onSubmit={onSubmit} noValidate>
            <label class="vauth-field">
                <span class="vauth-field-label">Organization name</span>
                <input
                    type="text"
                    required
                    value={name}
                    onInput={(e) => setName((e.target as HTMLInputElement).value)}
                    disabled={create.loading}
                />
            </label>
            <label class="vauth-field">
                <span class="vauth-field-label">Slug (optional)</span>
                <input
                    type="text"
                    pattern="[a-z0-9-]+"
                    placeholder="auto-derived from the name"
                    value={slug}
                    onInput={(e) => setSlug((e.target as HTMLInputElement).value)}
                    disabled={create.loading}
                />
            </label>
            {create.error && <div class="vauth-error" role="alert">{create.error.message}</div>}
            <button
                type="submit"
                class="vauth-btn vauth-btn-primary"
                disabled={create.loading || name.trim() === ''}
                aria-busy={create.loading}
            >
                {create.loading ? 'Creating…' : 'Create organization'}
            </button>
        </form>
    );
}
