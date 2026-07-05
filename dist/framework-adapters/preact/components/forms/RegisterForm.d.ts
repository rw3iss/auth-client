import type { ComponentChildren } from 'preact';
import type { AuthClient } from '../../../../core/auth-client.js';
import type { AuthResponse } from '../../../../core/types.js';
/**
 * Account-creation form. Captures the four core register fields
 * (email, password, first/last name) plus optional invite handling.
 *
 * Password strength: the SDK forwards whatever the user types — the
 * server is the source of truth on password policy (min length,
 * complexity, etc). This form surfaces server validation errors via
 * the action hook's `error` slot.
 *
 * On success: AuthClient transitions to `authenticated` automatically
 * (registration returns a token pair). The optional `onSuccess`
 * callback is for navigation / analytics.
 */
export interface RegisterFormProps {
    client?: AuthClient;
    /** Pre-fill email (e.g. from an invite link). */
    defaultEmail?: string;
    /** Invite code surfaced to /auth/register. */
    inviteCode?: string;
    /** Invite token (signed link). */
    inviteToken?: string;
    /** Organization the new user is joining. */
    organizationId?: string;
    /**
     * App code that scopes registration. The server applies this app's
     * `allowed_email_domains` + `allowed_auth_methods` policy and
     * auto-adds the new user to its `default_organization_id`. Default
     * falls back to the AuthClient's configured app code.
     */
    appCode?: string;
    /**
     * Client-side email-domain pre-validation. Bare domains (no '@'),
     * matched case-insensitively. Empty / undefined disables the
     * check (server still enforces). Typically wired from
     * `useAppPolicy().policy.allowed_email_domains` so the form's
     * UX matches the server's policy.
     */
    allowedEmailDomains?: string[];
    /** Slot rendered below the submit button (e.g. "Already have an account?"). */
    belowSubmit?: ComponentChildren;
    /** Slot rendered above the form. */
    aboveForm?: ComponentChildren;
    onSuccess?: (resp: AuthResponse) => void;
    onError?: (err: Error) => void;
    className?: string;
}
export declare function RegisterForm(props: RegisterFormProps): import("preact").JSX.Element;
//# sourceMappingURL=RegisterForm.d.ts.map