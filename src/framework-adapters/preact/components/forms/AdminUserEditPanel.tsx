/** @jsxImportSource preact */
import { useEffect, useState } from 'preact/hooks';
import {
    useSetUserRoles,
    useSetUserPassword,
    useHardDeleteUser,
    useAdminResetLockout,
} from '../../actions.js';
import { UserAvatar } from '../atoms/UserAvatar.js';
import { roleLabel } from '@rw3iss/auth-shared/constants';
import type { LookupUserRecord } from '../../../../core/flows/admin.flow.js';
import type { AuthClient } from '../../../../core/auth-client.js';

/**
 * Admin user-edit panel. Surfaces the slice of admin operations a
 * back-office user-management page needs:
 *
 *   - Role assignment — toggle a curated list of role codes; calls
 *     `PUT /admin/users/{id}/roles`.
 *   - Set password — admin can reset without the user's current
 *     password; calls `POST /auth/admin/set-password`.
 *   - Hard-delete — calls `DELETE /admin/users/{id}/hard` (system_admin
 *     only on the server; we gate the button on `currentUserIsSystemAdmin`).
 *
 * Composes the `UserAvatar` atom for visual identity. Caller-gated:
 * always wrap this in `<RoleGate anyOf={['system_admin','super_admin']}>`
 * upstream — the server enforces but a gate prevents the UI from showing
 * up at all for non-admins.
 */
export interface AdminUserEditPanelProps {
    user: LookupUserRecord;
    client?: AuthClient;
    /** Role codes the admin can toggle. Default: a reasonable subset. */
    assignableRoles?: string[];
    /** Currently-assigned role codes. */
    currentRoles?: string[];
    /** Whether the caller is system_admin — gates the hard-delete affordance. */
    currentUserIsSystemAdmin?: boolean;
    /** Fired after a successful save action (any of roles / password). */
    onSaved?: () => void;
    /** Fired after a successful hard-delete; consumer navigates away. */
    onDeleted?: () => void;
    /**
     * Which sections to render, in case the consumer wants to lay them out
     * across its own columns. Defaults to all. (`danger` still also requires
     * `currentUserIsSystemAdmin`.) Sections:
     *   - `header`   — avatar + name + email
     *   - `roles`    — base-role toggles + save
     *   - `password` — admin set-password
     *   - `lockout`  — clear failed-login lockout (count + lock)
     *   - `danger`   — hard-delete
     */
    include?: Array<'header' | 'roles' | 'password' | 'lockout' | 'danger'>;
    className?: string;
}

// Base (platform) roles only. Org-scoped roles (org_admin, org_manager,
// seller, buyer, org_member) are assigned per-organization via
// PUT /admin/organizations/{orgId}/members/{userId}/roles — the server
// rejects them here ("Cannot assign organization role as base role"), so
// they're intentionally excluded from this picker.
const DEFAULT_ASSIGNABLE: string[] = ['system_admin', 'super_admin', 'base_user'];

export function AdminUserEditPanel(props: AdminUserEditPanelProps) {
    const setRoles = useSetUserRoles(props.client);
    const setPassword = useSetUserPassword(props.client);
    const hardDelete = useHardDeleteUser(props.client);
    const resetLockout = useAdminResetLockout(props.client);

    const include = props.include ?? ['header', 'roles', 'password', 'lockout', 'danger'];
    const show = (s: 'header' | 'roles' | 'password' | 'lockout' | 'danger') => include.includes(s);

    const assignable = props.assignableRoles ?? DEFAULT_ASSIGNABLE;
    const [roles, setRolesState] = useState<string[]>(props.currentRoles ?? []);
    const [newPassword, setNewPassword] = useState('');
    const [savedFlag, setSavedFlag] = useState<string | null>(null);

    useEffect(() => {
        setRolesState(props.currentRoles ?? []);
    }, [props.currentRoles]);

    const toggleRole = (code: string) => {
        setRolesState((prev) => prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]);
    };

    const onSaveRoles = async () => {
        await setRoles.run({ userId: props.user.id, roleCodes: roles });
        setSavedFlag('Roles saved.');
        props.onSaved?.();
    };

    const onResetPassword = async () => {
        if (newPassword.length < 8) return;
        await setPassword.run({ userId: props.user.id, newPassword });
        setNewPassword('');
        setSavedFlag('Password updated.');
        props.onSaved?.();
    };

    const onResetLockout = async () => {
        await resetLockout.run(props.user.id);
        setSavedFlag('Lockout reset — failed-attempt count cleared + account unlocked.');
        props.onSaved?.();
    };

    const onHardDelete = async () => {
        const reason = typeof window !== 'undefined'
            ? window.prompt(`Hard-delete ${props.user.email}? Type a reason (audit log).`)
            : null;
        if (!reason) return;
        await hardDelete.run({ userId: props.user.id, reason });
        props.onDeleted?.();
    };

    return (
        <div class={`vauth-admin-user-edit ${props.className ?? ''}`}>
            {show('header') && (
                <header class="vauth-admin-user-edit-header">
                    <UserAvatar
                        size={48}
                        user={{
                            id: props.user.id,
                            email: props.user.email,
                            ...(props.user.display_name && { displayName: props.user.display_name }),
                        }}
                    />
                    <div>
                        <h2 class="vauth-admin-user-edit-name">
                            {props.user.display_name ?? (`${props.user.first_name ?? ''} ${props.user.last_name ?? ''}`.trim() || props.user.email)}
                        </h2>
                        <div class="vauth-admin-user-edit-email">{props.user.email}</div>
                    </div>
                </header>
            )}

            {show('roles') && (
            <section class="vauth-section">
                <h3>Base Roles</h3>
                <fieldset class="vauth-perm-picker" disabled={setRoles.loading}>
                    <legend>Platform-wide roles</legend>
                    {assignable.map((code) => (
                        <label key={code} class="vauth-perm-picker-item" title={code}>
                            <input
                                type="checkbox"
                                checked={roles.includes(code)}
                                onChange={() => toggleRole(code)}
                            />
                            <span class="vauth-perm-label">{roleLabel(code)}</span>
                        </label>
                    ))}
                </fieldset>
                {setRoles.error && <div class="vauth-error" role="alert">{setRoles.error.message}</div>}
                <button
                    type="button"
                    class="vauth-btn vauth-btn-primary"
                    onClick={onSaveRoles}
                    disabled={setRoles.loading}
                    aria-busy={setRoles.loading}
                >
                    {setRoles.loading ? 'Saving…' : 'Save roles'}
                </button>
            </section>
            )}

            {show('password') && (
            <section class="vauth-section">
                <h3>Reset password</h3>
                <label class="vauth-field">
                    <span class="vauth-field-label">New password</span>
                    <input
                        type="password"
                        autoComplete="new-password"
                        minLength={8}
                        value={newPassword}
                        onInput={(e) => setNewPassword((e.target as HTMLInputElement).value)}
                        disabled={setPassword.loading}
                    />
                    <span class="vauth-field-hint">User can sign in immediately with this password.</span>
                </label>
                {setPassword.error && <div class="vauth-error" role="alert">{setPassword.error.message}</div>}
                <button
                    type="button"
                    class="vauth-btn vauth-btn-ghost"
                    onClick={onResetPassword}
                    disabled={newPassword.length < 8 || setPassword.loading}
                    aria-busy={setPassword.loading}
                >
                    {setPassword.loading ? 'Updating…' : 'Set new password'}
                </button>
            </section>
            )}

            {show('lockout') && (
                <section class="vauth-section">
                    <h3>Account lockout</h3>
                    <p class="vauth-field-hint" style={{ marginBottom: 'var(--space-3, 12px)' }}>
                        Clears the failed-login attempt count and unlocks the account if it was
                        locked out by too many bad passwords.
                    </p>
                    {resetLockout.error && <div class="vauth-error" role="alert">{resetLockout.error.message}</div>}
                    <button
                        type="button"
                        class="vauth-btn vauth-btn-ghost"
                        onClick={onResetLockout}
                        disabled={resetLockout.loading}
                        aria-busy={resetLockout.loading}
                    >
                        {resetLockout.loading ? 'Resetting…' : 'Reset lockout'}
                    </button>
                </section>
            )}

            {savedFlag && <div class="vauth-form-success" role="status">{savedFlag}</div>}

            {show('danger') && props.currentUserIsSystemAdmin && (
                <section class="vauth-section">
                    <h3>Danger zone</h3>
                    {hardDelete.error && <div class="vauth-error" role="alert">{hardDelete.error.message}</div>}
                    <button
                        type="button"
                        class="vauth-btn vauth-btn-danger"
                        onClick={onHardDelete}
                        disabled={hardDelete.loading}
                    >
                        {hardDelete.loading ? 'Deleting…' : 'Permanently delete user'}
                    </button>
                </section>
            )}
        </div>
    );
}
