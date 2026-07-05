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
export declare function DeleteAccountForm(props: DeleteAccountFormProps): import("preact").JSX.Element;
//# sourceMappingURL=DeleteAccountForm.d.ts.map