/** @jsxImportSource preact */
import { useState } from 'preact/hooks';
import type { ComponentChildren } from 'preact';
import { useRegister } from '../../actions.js';
import { PasswordStrengthMeter } from '../atoms/PasswordStrengthMeter.js';
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

export function RegisterForm(props: RegisterFormProps) {
    const register = useRegister(props.client);
    const [email, setEmail] = useState(props.defaultEmail ?? '');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [localError, setLocalError] = useState<string | null>(null);

    const onSubmit = async (e: Event) => {
        e.preventDefault();
        setLocalError(null);
        // Client-side domain check — friendly UX. The server re-validates
        // on the actual register call so a bypass attempt still fails.
        if (props.allowedEmailDomains && props.allowedEmailDomains.length > 0) {
            const at = email.lastIndexOf('@');
            const domain = at >= 0 ? email.slice(at + 1).toLowerCase() : '';
            const ok = props.allowedEmailDomains.some(
                (d) => d.toLowerCase() === domain,
            );
            if (!ok) {
                setLocalError(
                    `Your email must end in one of: ${props.allowedEmailDomains.map((d) => '@' + d).join(', ')}`,
                );
                return;
            }
        }
        try {
            const resp = await register.run({
                email,
                password,
                firstName,
                lastName,
                ...(props.organizationId && { organizationId: props.organizationId }),
                ...(props.inviteCode && { inviteCode: props.inviteCode }),
                ...(props.inviteToken && { inviteToken: props.inviteToken }),
                ...(props.appCode && { appCode: props.appCode }),
            });
            props.onSuccess?.(resp);
        } catch (err) {
            const e = err instanceof Error ? err : new Error(String(err));
            setLocalError(e.message);
            props.onError?.(e);
        }
    };

    const displayError = localError ?? register.error?.message ?? null;
    return (
        <form class={`vauth-form vauth-register-form ${props.className ?? ''}`} onSubmit={onSubmit} noValidate>
            {props.aboveForm}
            <div class="vauth-field-row">
                <label class="vauth-field">
                    <span class="vauth-field-label">First name</span>
                    <input
                        type="text"
                        autoComplete="given-name"
                        required
                        value={firstName}
                        onInput={(e) => setFirstName((e.target as HTMLInputElement).value)}
                        disabled={register.loading}
                    />
                </label>
                <label class="vauth-field">
                    <span class="vauth-field-label">Last name</span>
                    <input
                        type="text"
                        autoComplete="family-name"
                        required
                        value={lastName}
                        onInput={(e) => setLastName((e.target as HTMLInputElement).value)}
                        disabled={register.loading}
                    />
                </label>
            </div>
            <label class="vauth-field">
                <span class="vauth-field-label">Email</span>
                <input
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onInput={(e) => setEmail((e.target as HTMLInputElement).value)}
                    disabled={register.loading}
                />
            </label>
            <label class="vauth-field">
                <span class="vauth-field-label">Password</span>
                <input
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    value={password}
                    onInput={(e) => setPassword((e.target as HTMLInputElement).value)}
                    disabled={register.loading}
                />
                <PasswordStrengthMeter password={password} />
                <span class="vauth-field-hint">At least 8 characters, with upper, lower, and digit.</span>
            </label>
            {displayError && <div class="vauth-error" role="alert">{displayError}</div>}
            <button
                type="submit"
                class="vauth-btn vauth-btn-primary"
                disabled={register.loading}
                aria-busy={register.loading}
            >
                {register.loading ? 'Creating account…' : 'Create account'}
            </button>
            {props.belowSubmit}
        </form>
    );
}
