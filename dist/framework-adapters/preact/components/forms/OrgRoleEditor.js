import { jsx as _jsx, jsxs as _jsxs } from "preact/jsx-runtime";
/** @jsxImportSource preact */
import { useEffect, useState } from 'preact/hooks';
import { useListOrgRoles, useCreateOrgRole, useUpdateOrgRole, useDeleteOrgRole, useListAssignablePermissions, } from '../../actions.js';
import { useOrg } from '../../hooks.js';
export function OrgRoleEditor(props) {
    const org = useOrg(props.client);
    const list = useListOrgRoles(props.client);
    const perms = useListAssignablePermissions(props.client);
    const create = useCreateOrgRole(props.client);
    const update = useUpdateOrgRole(props.client);
    const del = useDeleteOrgRole(props.client);
    const orgId = props.orgId ?? org?.id;
    const [roles, setRoles] = useState([]);
    const [assignable, setAssignable] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [draftCode, setDraftCode] = useState('');
    const [draftName, setDraftName] = useState('');
    const [draftDescription, setDraftDescription] = useState('');
    const [draftPerms, setDraftPerms] = useState([]);
    useEffect(() => {
        if (!orgId)
            return;
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
        }
        else if (selected) {
            setDraftCode(selected.code);
            setDraftName(selected.name);
            setDraftDescription(selected.description ?? '');
            setDraftPerms(selected.permissions ?? []);
        }
    }, [selectedId, selected]);
    if (!orgId)
        return _jsx("div", { class: "vauth-form-loading", children: "No active organization." });
    const togglePerm = (code) => {
        setDraftPerms((prev) => prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]);
    };
    const onSave = async (e) => {
        e.preventDefault();
        if (selectedId === 'new') {
            const created = await create.run({
                orgId,
                body: { code: draftCode, name: draftName, description: draftDescription, permission_codes: draftPerms },
            });
            setRoles((prev) => [...prev, created]);
            setSelectedId(created.id);
        }
        else if (selected) {
            const updated = await update.run({
                orgId,
                roleId: selected.id,
                body: { name: draftName, description: draftDescription, permission_codes: draftPerms },
            });
            setRoles((prev) => prev.map((r) => r.id === updated.id ? updated : r));
        }
    };
    const onDelete = async () => {
        if (!selected || selected.is_system)
            return;
        if (typeof window !== 'undefined' && !window.confirm(`Delete role "${selected.name}"?`))
            return;
        await del.run({ orgId, roleId: selected.id });
        setRoles((prev) => prev.filter((r) => r.id !== selected.id));
        setSelectedId(null);
    };
    return (_jsxs("div", { class: `vauth-role-editor ${props.className ?? ''}`, children: [_jsxs("aside", { class: "vauth-role-list", children: [_jsxs("header", { children: [_jsx("h4", { children: "Roles" }), _jsx("button", { type: "button", class: "vauth-btn vauth-btn-ghost vauth-btn-sm", onClick: () => setSelectedId('new'), children: "+ New role" })] }), _jsx("ul", { children: roles.map((r) => (_jsxs("li", { class: r.id === selectedId ? 'vauth-role-list-item-selected' : '', onClick: () => setSelectedId(r.id), children: [_jsx("div", { class: "vauth-role-list-name", children: r.name }), _jsxs("div", { class: "vauth-role-list-code", children: [r.code, r.is_system && ' · system'] })] }, r.id))) })] }), _jsxs("section", { class: "vauth-role-edit", children: [selectedId === null && _jsx("p", { class: "vauth-form-loading", children: "Select a role to edit, or create a new one." }), selectedId !== null && (_jsxs("form", { onSubmit: onSave, children: [_jsxs("label", { class: "vauth-field", children: [_jsx("span", { class: "vauth-field-label", children: "Code" }), _jsx("input", { class: "vauth-input", type: "text", required: true, value: draftCode, onInput: (e) => setDraftCode(e.target.value), disabled: selectedId !== 'new' || (selected?.is_system === true) })] }), _jsxs("label", { class: "vauth-field", children: [_jsx("span", { class: "vauth-field-label", children: "Name" }), _jsx("input", { class: "vauth-input", type: "text", required: true, value: draftName, onInput: (e) => setDraftName(e.target.value), disabled: selected?.is_system === true })] }), _jsxs("label", { class: "vauth-field", children: [_jsx("span", { class: "vauth-field-label", children: "Description" }), _jsx("textarea", { class: "vauth-input", rows: 2, value: draftDescription, onInput: (e) => setDraftDescription(e.target.value), disabled: selected?.is_system === true })] }), _jsxs("fieldset", { class: "vauth-perm-picker", disabled: selected?.is_system === true, children: [_jsx("legend", { children: "Permissions" }), assignable.map((p) => (_jsxs("label", { class: "vauth-perm-picker-item", children: [_jsx("input", { type: "checkbox", checked: draftPerms.includes(p.code), onChange: () => togglePerm(p.code) }), _jsx("span", { class: "vauth-perm-code", children: p.code }), p.name && _jsx("span", { class: "vauth-perm-name", children: p.name })] }, p.code)))] }), (create.error || update.error || del.error) && (_jsx("div", { class: "vauth-error", role: "alert", children: (create.error ?? update.error ?? del.error)?.message })), _jsxs("div", { class: "vauth-form-actions", children: [_jsx("button", { type: "submit", class: "vauth-btn vauth-btn-primary", disabled: create.loading || update.loading || (selected?.is_system === true), children: selectedId === 'new' ? 'Create role' : 'Save changes' }), selectedId !== 'new' && !selected?.is_system && (_jsx("button", { type: "button", class: "vauth-btn vauth-btn-danger", onClick: onDelete, disabled: del.loading, children: "Delete role" }))] })] }))] })] }));
}
//# sourceMappingURL=OrgRoleEditor.js.map