/** @jsxImportSource preact */
import { useEffect, useState } from 'preact/hooks';
import {
    useListOrgRoles,
    useCreateOrgRole,
    useUpdateOrgRole,
    useDeleteOrgRole,
    useListAssignablePermissions,
} from '../../actions.js';
import { useOrg } from '../../hooks.js';
import type {
    OrgRoleRecord,
    AssignablePermissionRecord,
} from '../../../../core/flows/org.flow.js';
import type { AuthClient } from '../../../../core/auth-client.js';

/**
 * Custom org-role editor. Two columns:
 *
 *   Left: list of roles (system + custom). Click to select; selecting
 *   a custom role opens the editor on the right.
 *
 *   Right: name / description / permission picker. The permission
 *   picker is keyed off `/orgs/{orgId}/permissions/assignable` so
 *   the server gates which permissions an org admin can grant
 *   (org-system perms like `organizations:delete` stay off-limits
 *   even to org_admin custom-role authors — AUDIT C3).
 *
 * Built-in / system roles render as read-only and the delete button
 * is hidden on them. New roles are created via the "+ New role"
 * affordance in the list header.
 */
export interface OrgRoleEditorProps {
    client?: AuthClient;
    orgId?: string;
    className?: string;
}

export function OrgRoleEditor(props: OrgRoleEditorProps) {
    const org = useOrg(props.client);
    const list = useListOrgRoles(props.client);
    const perms = useListAssignablePermissions(props.client);
    const create = useCreateOrgRole(props.client);
    const update = useUpdateOrgRole(props.client);
    const del = useDeleteOrgRole(props.client);

    const orgId = props.orgId ?? org?.id;
    const [roles, setRoles] = useState<OrgRoleRecord[]>([]);
    const [assignable, setAssignable] = useState<AssignablePermissionRecord[]>([]);
    const [selectedId, setSelectedId] = useState<string | 'new' | null>(null);
    const [draftCode, setDraftCode] = useState('');
    const [draftName, setDraftName] = useState('');
    const [draftDescription, setDraftDescription] = useState('');
    const [draftPerms, setDraftPerms] = useState<string[]>([]);

    useEffect(() => {
        if (!orgId) return;
        void list.run(orgId).then(setRoles);
        void perms.run(orgId).then(setAssignable);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [orgId]);

    const selected = selectedId && selectedId !== 'new' ? roles.find((r) => r.id === selectedId) : null;

    useEffect(() => {
        if (selectedId === 'new') {
            setDraftCode('');
            setDraftName('');
            setDraftDescription('');
            setDraftPerms([]);
        } else if (selected) {
            setDraftCode(selected.code);
            setDraftName(selected.name);
            setDraftDescription(selected.description ?? '');
            setDraftPerms(selected.permissions ?? []);
        }
    }, [selectedId, selected]);

    if (!orgId) return <div class="vauth-form-loading">No active organization.</div>;

    const togglePerm = (code: string) => {
        setDraftPerms((prev) => prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]);
    };

    const onSave = async (e: Event) => {
        e.preventDefault();
        if (selectedId === 'new') {
            const created = await create.run({
                orgId,
                body: { code: draftCode, name: draftName, description: draftDescription, permission_codes: draftPerms },
            });
            setRoles((prev) => [...prev, created]);
            setSelectedId(created.id);
        } else if (selected) {
            const updated = await update.run({
                orgId,
                roleId: selected.id,
                body: { name: draftName, description: draftDescription, permission_codes: draftPerms },
            });
            setRoles((prev) => prev.map((r) => r.id === updated.id ? updated : r));
        }
    };

    const onDelete = async () => {
        if (!selected || selected.is_system) return;
        if (typeof window !== 'undefined' && !window.confirm(`Delete role "${selected.name}"?`)) return;
        await del.run({ orgId, roleId: selected.id });
        setRoles((prev) => prev.filter((r) => r.id !== selected.id));
        setSelectedId(null);
    };

    return (
        <div class={`vauth-role-editor ${props.className ?? ''}`}>
            <aside class="vauth-role-list">
                <header>
                    <h4>Roles</h4>
                    <button type="button" class="vauth-btn vauth-btn-ghost vauth-btn-sm" onClick={() => setSelectedId('new')}>+ New role</button>
                </header>
                <ul>
                    {roles.map((r) => (
                        <li
                            key={r.id}
                            class={r.id === selectedId ? 'vauth-role-list-item-selected' : ''}
                            onClick={() => setSelectedId(r.id)}
                        >
                            <div class="vauth-role-list-name">{r.name}</div>
                            <div class="vauth-role-list-code">{r.code}{r.is_system && ' · system'}</div>
                        </li>
                    ))}
                </ul>
            </aside>
            <section class="vauth-role-edit">
                {selectedId === null && <p class="vauth-form-loading">Select a role to edit, or create a new one.</p>}
                {selectedId !== null && (
                    <form onSubmit={onSave}>
                        <label class="vauth-field">
                            <span class="vauth-field-label">Code</span>
                            <input
                                class="vauth-input"
                                type="text"
                                required
                                value={draftCode}
                                onInput={(e) => setDraftCode((e.target as HTMLInputElement).value)}
                                disabled={selectedId !== 'new' || (selected?.is_system === true)}
                            />
                        </label>
                        <label class="vauth-field">
                            <span class="vauth-field-label">Name</span>
                            <input
                                class="vauth-input"
                                type="text"
                                required
                                value={draftName}
                                onInput={(e) => setDraftName((e.target as HTMLInputElement).value)}
                                disabled={selected?.is_system === true}
                            />
                        </label>
                        <label class="vauth-field">
                            <span class="vauth-field-label">Description</span>
                            <textarea
                                class="vauth-input"
                                rows={2}
                                value={draftDescription}
                                onInput={(e) => setDraftDescription((e.target as HTMLTextAreaElement).value)}
                                disabled={selected?.is_system === true}
                            />
                        </label>
                        <fieldset class="vauth-perm-picker" disabled={selected?.is_system === true}>
                            <legend>Permissions</legend>
                            {assignable.map((p) => (
                                <label key={p.code} class="vauth-perm-picker-item">
                                    <input
                                        type="checkbox"
                                        checked={draftPerms.includes(p.code)}
                                        onChange={() => togglePerm(p.code)}
                                    />
                                    <span class="vauth-perm-code">{p.code}</span>
                                    {p.name && <span class="vauth-perm-name">{p.name}</span>}
                                </label>
                            ))}
                        </fieldset>
                        {(create.error || update.error || del.error) && (
                            <div class="vauth-error" role="alert">
                                {(create.error ?? update.error ?? del.error)?.message}
                            </div>
                        )}
                        <div class="vauth-form-actions">
                            <button
                                type="submit"
                                class="vauth-btn vauth-btn-primary"
                                disabled={create.loading || update.loading || (selected?.is_system === true)}
                            >
                                {selectedId === 'new' ? 'Create role' : 'Save changes'}
                            </button>
                            {selectedId !== 'new' && !selected?.is_system && (
                                <button
                                    type="button"
                                    class="vauth-btn vauth-btn-danger"
                                    onClick={onDelete}
                                    disabled={del.loading}
                                >
                                    Delete role
                                </button>
                            )}
                        </div>
                    </form>
                )}
            </section>
        </div>
    );
}
