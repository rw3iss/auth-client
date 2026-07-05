import { jsx as _jsx, jsxs as _jsxs } from "preact/jsx-runtime";
/** @jsxImportSource preact */
import { useEffect, useState } from 'preact/hooks';
import { useGetOrg, useUpdateOrg } from '../../actions.js';
import { useOrg } from '../../hooks.js';
export function OrgSettingsForm(props) {
    const activeOrg = useOrg(props.client);
    const load = useGetOrg(props.client);
    const save = useUpdateOrg(props.client);
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const orgId = props.orgId ?? activeOrg?.id;
    useEffect(() => {
        if (!orgId)
            return;
        void load.run(orgId).then((org) => {
            setName(org.name ?? '');
            setSlug(org.slug ?? '');
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [orgId]);
    const onSubmit = async (e) => {
        e.preventDefault();
        if (!orgId)
            return;
        await save.run({ orgId, body: { name, slug } });
        setSubmitted(true);
        props.onSaved?.();
    };
    if (!orgId)
        return _jsx("div", { class: "vauth-form-loading", children: "No active organization." });
    if (load.loading && !load.data)
        return _jsx("div", { class: "vauth-form-loading", children: "Loading settings\u2026" });
    return (_jsxs("form", { class: `vauth-form vauth-org-settings-form ${props.className ?? ''}`, onSubmit: onSubmit, noValidate: true, children: [_jsxs("label", { class: "vauth-field", children: [_jsx("span", { class: "vauth-field-label", children: "Organization name" }), _jsx("input", { type: "text", required: true, value: name, onInput: (e) => setName(e.target.value), disabled: save.loading })] }), _jsxs("label", { class: "vauth-field", children: [_jsx("span", { class: "vauth-field-label", children: "Slug" }), _jsx("input", { type: "text", required: true, pattern: "[a-z0-9-]+", value: slug, onInput: (e) => setSlug(e.target.value), disabled: save.loading }), _jsx("span", { class: "vauth-field-hint", children: "Lowercase letters, digits, and hyphens. Shows up in URLs." })] }), save.error && _jsx("div", { class: "vauth-error", role: "alert", children: save.error.message }), submitted && !save.error && _jsx("div", { class: "vauth-form-success", role: "status", children: "Settings saved." }), _jsx("button", { type: "submit", class: "vauth-btn vauth-btn-primary", disabled: save.loading, "aria-busy": save.loading, children: save.loading ? 'Saving…' : 'Save changes' })] }));
}
//# sourceMappingURL=OrgSettingsForm.js.map