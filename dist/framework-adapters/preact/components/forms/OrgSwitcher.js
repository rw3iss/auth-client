import { jsx as _jsx, jsxs as _jsxs } from "preact/jsx-runtime";
/** @jsxImportSource preact */
import { useEffect, useState } from 'preact/hooks';
import { useGetMyOrgs, useSwitchOrg } from '../../actions.js';
import { useAuth } from '../../hooks.js';
export function OrgSwitcher(props) {
    const snap = useAuth(props.client);
    const list = useGetMyOrgs(props.client);
    const switchOrg = useSwitchOrg(props.client);
    const [orgs, setOrgs] = useState([]);
    const currentOrgId = snap.claims?.org_id;
    useEffect(() => {
        if (snap.status !== 'authenticated')
            return;
        if (list.isIdle) {
            void list.run().then((data) => setOrgs(data));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [snap.status]);
    const onChange = async (e) => {
        const target = e.target;
        const orgId = target.value;
        const org = orgs.find((o) => o.id === orgId);
        if (!org || org.id === currentOrgId)
            return;
        try {
            await switchOrg.run(orgId);
            props.onSwitch?.(org);
        }
        catch (err) {
            props.onError?.(err instanceof Error ? err : new Error(String(err)));
        }
    };
    if (snap.status !== 'authenticated')
        return null;
    if (orgs.length === 0 && !list.loading)
        return null;
    return (_jsxs("label", { class: `vauth-org-switcher ${props.className ?? ''}`, children: [_jsx("span", { class: "vauth-field-label", children: "Organization" }), _jsx("select", { value: currentOrgId ?? '', onChange: onChange, disabled: switchOrg.loading || list.loading, "aria-busy": switchOrg.loading, children: orgs.map((o) => (_jsx("option", { value: o.id, children: o.name }, o.id))) }), switchOrg.error && _jsx("span", { class: "vauth-error", role: "alert", children: switchOrg.error.message })] }));
}
//# sourceMappingURL=OrgSwitcher.js.map