/** @jsxImportSource preact */
import { useState } from 'preact/hooks';
import { useDeleteMyAccount } from '../../actions.js';
import type { AuthClient } from '../../../../core/auth-client.js';

/**
 * Self-service account-deletion form. The dangerous-zone twin of
 * <ChangePasswordForm>. Requires:
 *   1. Current password (re-auth defense).
 *   2. Type "DELETE" exactly to confirm — defends against an
 *      attacker firing the endpoint via stolen credentials without
 *      the user noticing.
 *
 * On success: caller is logged out cross-replica (token-version bumped
 * on the server side) and the snapshot flips to anonymous. Wire
 * `onDeleted` to navigate to a "we're sorry to see you go" page or
 * back to the marketing site.
 */
export interface DeleteAccountFormProps {
    client?: AuthClient;
    onDeleted?: () => void;
    onError?: (err: Error) => void;
    className?: string;
}

export function DeleteAccountForm(props: DeleteAccountFormProps) {
    const action = useDeleteMyAccount(props.client);
    const [password, setPassword] = useState('');
    const [confirmation, setConfirmation] = useState('');

    const canSubmit = password.length > 0 && confirmation === 'DELETE';

    const onSubmit = async (e: Event) => {
        e.preventDefault();
        if (!canSubmit) return;
        try {
            await action.run(password);
            props.onDeleted?.();
        } catch (err) {
            props.onError?.(err instanceof Error ? err : new Error(String(err)));
        }
    };

    return (
        <form class={`vauth-form vauth-delete-account-form ${props.className ?? ''}`} onSubmit={onSubmit} noValidate>
            <div class="vauth-danger-banner">
                <strong>Permanent.</strong>{' '}
                Deleting your account removes your data immediately and can't be undone. Active sessions
                across all devices will end the moment we finish.
            </div>
            <label class="vauth-field">
                <span class="vauth-field-label">Current password</span>
                <input
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onInput={(e) => setPassword((e.target as HTMLInputElement).value)}
                    disabled={action.loading}
                />
            </label>
            <label class="vauth-field">
                <span class="vauth-field-label">Type <code>DELETE</code> to confirm</span>
                <input
                    type="text"
                    autoComplete="off"
                    spellcheck={false}
                    required
                    value={confirmation}
                    onInput={(e) => setConfirmation((e.target as HTMLInputElement).value)}
                    disabled={action.loading}
                />
            </label>
            {action.error && <div class="vauth-error" role="alert">{action.error.message}</div>}
            <button
                type="submit"
                class="vauth-btn vauth-btn-danger"
                disabled={!canSubmit || action.loading}
                aria-busy={action.loading}
            >
                {action.loading ? 'Deleting…' : 'Permanently delete my account'}
            </button>
        </form>
    );
}
