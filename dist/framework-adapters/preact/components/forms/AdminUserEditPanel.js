import { jsx as _jsx, jsxs as _jsxs } from "preact/jsx-runtime";
/** @jsxImportSource preact */
import { useEffect, useState } from 'preact/hooks';
import { useSetUserRoles, useSetUserPassword, useHardDeleteUser, useAdminResetLockout, } from '../../actions.js';
import { UserAvatar } from '../atoms/UserAvatar.js';
import { roleLabel } from '@rw3iss/auth-shared/constants';
// Base (platform) roles only. Org-scoped roles (org_admin, org_manager,
// seller, buyer, org_member) are assigned per-organization via
// PUT /admin/organizations/{orgId}/members/{userId}/roles — the server
// rejects them here ("Cannot assign organization role as base role"), so
// they're intentionally excluded from this picker.
const DEFAULT_ASSIGNABLE = ['system_admin', 'super_admin', 'base_user'];
export function AdminUserEditPanel(props) {
    const setRoles = useSetUserRoles(props.client);
    const setPassword = useSetUserPassword(props.client);
    const hardDelete = useHardDeleteUser(props.client);
    const resetLockout = useAdminResetLockout(props.client);
    const include = props.include ?? ['header', 'roles', 'password', 'lockout', 'danger'];
    const show = (s) => include.includes(s);
    const assignable = props.assignableRoles ?? DEFAULT_ASSIGNABLE;
    const [roles, setRolesState] = useState(props.currentRoles ?? []);
    const [newPassword, setNewPassword] = useState('');
    const [savedFlag, setSavedFlag] = useState(null);
    useEffect(() => {
        setRolesState(props.currentRoles ?? []);
    }, [props.currentRoles]);
    const toggleRole = (code) => {
        setRolesState((prev) => prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]);
    };
    const onSaveRoles = async () => {
        await setRoles.run({ userId: props.user.id, roleCodes: roles });
        setSavedFlag('Roles saved.');
        props.onSaved?.();
    };
    const onResetPassword = async () => {
        if (newPassword.length < 8)
            return;
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
        if (!reason)
            return;
        await hardDelete.run({ userId: props.user.id, reason });
        props.onDeleted?.();
    };
    return (_jsxs("div", { class: `vauth-admin-user-edit ${props.className ?? ''}`, children: [show('header') && (_jsxs("header", { class: "vauth-admin-user-edit-header", children: [_jsx(UserAvatar, { size: 48, user: {
                            id: props.user.id,
                            email: props.user.email,
                            ...(props.user.display_name && { displayName: props.user.display_name }),
                        } }), _jsxs("div", { children: [_jsx("h2", { class: "vauth-admin-user-edit-name", children: props.user.display_name ?? (`${props.user.first_name ?? ''} ${props.user.last_name ?? ''}`.trim() || props.user.email) }), _jsx("div", { class: "vauth-admin-user-edit-email", children: props.user.email })] })] })), show('roles') && (_jsxs("section", { class: "vauth-section", children: [_jsx("h3", { children: "Base Roles" }), _jsxs("fieldset", { class: "vauth-perm-picker", disabled: setRoles.loading, children: [_jsx("legend", { children: "Platform-wide roles" }), assignable.map((code) => (_jsxs("label", { class: "vauth-perm-picker-item", title: code, children: [_jsx("input", { type: "checkbox", checked: roles.includes(code), onChange: () => toggleRole(code) }), _jsx("span", { class: "vauth-perm-label", children: roleLabel(code) })] }, code)))] }), setRoles.error && _jsx("div", { class: "vauth-error", role: "alert", children: setRoles.error.message }), _jsx("button", { type: "button", class: "vauth-btn vauth-btn-primary", onClick: onSaveRoles, disabled: setRoles.loading, "aria-busy": setRoles.loading, children: setRoles.loading ? 'Saving…' : 'Save roles' })] })), show('password') && (_jsxs("section", { class: "vauth-section", children: [_jsx("h3", { children: "Reset password" }), _jsxs("label", { class: "vauth-field", children: [_jsx("span", { class: "vauth-field-label", children: "New password" }), _jsx("input", { type: "password", autoComplete: "new-password", minLength: 8, value: newPassword, onInput: (e) => setNewPassword(e.target.value), disabled: setPassword.loading }), _jsx("span", { class: "vauth-field-hint", children: "User can sign in immediately with this password." })] }), setPassword.error && _jsx("div", { class: "vauth-error", role: "alert", children: setPassword.error.message }), _jsx("button", { type: "button", class: "vauth-btn vauth-btn-ghost", onClick: onResetPassword, disabled: newPassword.length < 8 || setPassword.loading, "aria-busy": setPassword.loading, children: setPassword.loading ? 'Updating…' : 'Set new password' })] })), show('lockout') && (_jsxs("section", { class: "vauth-section", children: [_jsx("h3", { children: "Account lockout" }), _jsx("p", { class: "vauth-field-hint", style: { marginBottom: 'var(--space-3, 12px)' }, children: "Clears the failed-login attempt count and unlocks the account if it was locked out by too many bad passwords." }), resetLockout.error && _jsx("div", { class: "vauth-error", role: "alert", children: resetLockout.error.message }), _jsx("button", { type: "button", class: "vauth-btn vauth-btn-ghost", onClick: onResetLockout, disabled: resetLockout.loading, "aria-busy": resetLockout.loading, children: resetLockout.loading ? 'Resetting…' : 'Reset lockout' })] })), savedFlag && _jsx("div", { class: "vauth-form-success", role: "status", children: savedFlag }), show('danger') && props.currentUserIsSystemAdmin && (_jsxs("section", { class: "vauth-section", children: [_jsx("h3", { children: "Danger zone" }), hardDelete.error && _jsx("div", { class: "vauth-error", role: "alert", children: hardDelete.error.message }), _jsx("button", { type: "button", class: "vauth-btn vauth-btn-danger", onClick: onHardDelete, disabled: hardDelete.loading, children: hardDelete.loading ? 'Deleting…' : 'Permanently delete user' })] }))] }));
}
//# sourceMappingURL=AdminUserEditPanel.js.map