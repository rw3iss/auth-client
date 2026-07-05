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
export declare function OrgCreateForm(props: OrgCreateFormProps): import("preact").JSX.Element;
//# sourceMappingURL=OrgCreateForm.d.ts.map