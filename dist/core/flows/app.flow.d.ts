/**
 * App-scoped utility flows. Today this is just the public
 * registration-policy lookup — `GET /apps/{code}/registration-policy`
 * — which exposes the per-app UX hints (allowed email domains,
 * allowed auth methods, default org name) the server uses to gate
 * registrations.
 *
 * The endpoint is anonymous so a login/register form can pre-filter
 * SSO buttons + show domain hints BEFORE the user submits. The server
 * re-validates on the actual register call so the client signal is
 * UX only, never security.
 */
import { type FlowDeps } from './flow-deps.js';
export interface RegistrationPolicy {
    /** Echo of the requested app code. */
    code: string;
    /** Human-readable app name. */
    name: string;
    /** Bare domain strings (no '@'). Empty = any domain accepted. */
    allowed_email_domains: string[];
    /** "password", "google", "apple", "microsoft", "github", "custom".
     *  Empty = any enabled method. */
    allowed_auth_methods: string[];
    /** True when the app auto-adds new registrants to a default org. */
    has_default_organization: boolean;
    /** Org name shown in the registration prompt; only present when
     *  has_default_organization is true. */
    default_organization_name?: string;
}
export declare class AppFlow {
    private readonly deps;
    constructor(deps: FlowDeps);
    /**
     * Fetch the public registration policy for an app. Anonymous —
     * no token required. Throws if the app code is unknown.
     */
    getRegistrationPolicy(appCode: string): Promise<RegistrationPolicy>;
}
//# sourceMappingURL=app.flow.d.ts.map