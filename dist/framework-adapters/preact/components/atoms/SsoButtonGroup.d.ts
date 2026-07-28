import type { AuthClient } from '../../../../core/auth-client.js';
/**
 * Pre-arranged vertical stack of the four built-in SSO buttons. Pass
 * `providers` to filter or reorder. Useful as a single drop-in for
 * login pages; render the individual brand buttons directly for more
 * control over layout.
 */
export type SsoProviderName = 'google' | 'apple' | 'microsoft' | 'github' | 'x';
export interface SsoButtonGroupProps {
    redirectUrl: string;
    /** Which providers to render, in order. Default: all four. */
    providers?: SsoProviderName[];
    /**
     * If set, only providers whose names appear here render. Plus
     * 'password' is filtered out (it's a no-op for an SSO group).
     * Wire from `useAppPolicy().policy.allowed_auth_methods` so the
     * group respects per-app policy automatically.
     */
    allowedAuthMethods?: string[];
    client?: AuthClient;
    organizationId?: string;
    inviteCode?: string;
    onError?: (err: Error) => void;
    className?: string;
}
export declare function SsoButtonGroup(props: SsoButtonGroupProps): import("preact").JSX.Element | null;
//# sourceMappingURL=SsoButtonGroup.d.ts.map