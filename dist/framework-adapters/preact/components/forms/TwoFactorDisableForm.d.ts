import type { AuthClient } from '../../../../core/auth-client.js';
/**
 * Disable 2FA. Server requires BOTH the current password and a fresh
 * TOTP code as defense against accidental / hijack-driven disable.
 * On success, the user's token-version is bumped so every existing
 * session learns 2FA is off (otherwise users could see stale UI).
 */
export interface TwoFactorDisableFormProps {
    client?: AuthClient;
    onSuccess?: () => void;
    onError?: (err: Error) => void;
    className?: string;
}
export declare function TwoFactorDisableForm(props: TwoFactorDisableFormProps): import("preact").JSX.Element;
//# sourceMappingURL=TwoFactorDisableForm.d.ts.map