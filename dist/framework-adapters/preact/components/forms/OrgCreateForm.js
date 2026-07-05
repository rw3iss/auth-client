import { jsx as _jsx, jsxs as _jsxs } from "preact/jsx-runtime";
/** @jsxImportSource preact */
import { useState } from 'preact/hooks';
import { useCreateOrg } from '../../actions.js';
export function OrgCreateForm(props) {
    const create = useCreateOrg(props.client);
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            const org = await create.run({ name, ...(slug && { slug }) });
            props.onCreated?.(org);
            setName('');
            setSlug('');
        }
        catch (err) {
            props.onError?.(err instanceof Error ? err : new Error(String(err)));
        }
    };
    return (_jsxs("form", { class: `vauth-form vauth-org-create-form ${props.className ?? ''}`, onSubmit: onSubmit, noValidate: true, children: [_jsxs("label", { class: "vauth-field", children: [_jsx("span", { class: "vauth-field-label", children: "Organization name" }), _jsx("input", { type: "text", required: true, value: name, onInput: (e) => setName(e.target.value), disabled: create.loading })] }), _jsxs("label", { class: "vauth-field", children: [_jsx("span", { class: "vauth-field-label", children: "Slug (optional)" }), _jsx("input", { type: "text", pattern: "[a-z0-9-]+", placeholder: "auto-derived from the name", value: slug, onInput: (e) => setSlug(e.target.value), disabled: create.loading })] }), create.error && _jsx("div", { class: "vauth-error", role: "alert", children: create.error.message }), _jsx("button", { type: "submit", class: "vauth-btn vauth-btn-primary", disabled: create.loading || name.trim() === '', "aria-busy": create.loading, children: create.loading ? 'Creating…' : 'Create organization' })] }));
}
//# sourceMappingURL=OrgCreateForm.js.map