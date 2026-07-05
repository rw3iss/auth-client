/**
 * `client.account` — the signed-in user's own account: password
 * lifecycle, email verification, two-factor auth, own org
 * memberships, invitations addressed to them, and self-deletion.
 * Implemented over ctx.flows (password / emailVerification / totp /
 * org); the operations that touch session state (2FA disable,
 * delete-my-account, own-orgs refresh) delegate to ctx.core.
 */
import type { ModuleContext } from '../module-context.js';
import type { MyOrgRecord, Organization } from '../types.js';
import type { InvitationRecord } from '../flows/org.flow.js';
export declare class AccountModule {
    private readonly ctx;
    constructor(ctx: ModuleContext);
    /**
     * Request a password-reset email. Server returns 200 regardless of
     * whether the email exists (anti-enumeration). Anonymous flow.
     */
    requestPasswordReset(email: string, appCode?: string): Promise<void>;
    /**
     * Reset a password using a single-use token from the reset email.
     * After success, the user must log in normally with the new password.
     * Anonymous flow — no existing session required.
     */
    resetPassword(token: string, newPassword: string): Promise<void>;
    /**
     * Change the password for the currently-signed-in user. Server
     * verifies the current password before applying the change.
     * Authenticated flow — caller must be signed in.
     */
    changePassword(currentPassword: string, newPassword: string): Promise<void>;
    /** Consume a single-use email-verification token from the verify email. */
    verifyEmail(token: string): Promise<void>;
    /** Re-issue a verification email. Always succeeds (anti-enumeration). */
    resendVerificationEmail(email: string, appCode?: string): Promise<void>;
    /** Begin TOTP enrollment. Returns the provisioning URI + base32 secret
     * for the consumer to render as a QR code. */
    setupTwoFactor(): Promise<{
        secret: string;
        provisioningUri: string;
    }>;
    /** Submit the first TOTP code to complete enrollment. */
    enableTwoFactor(code: string): Promise<void>;
    /** Turn 2FA off — requires the current password + a fresh code. */
    disableTwoFactor(params: {
        password: string;
        code: string;
    }): Promise<void>;
    /**
     * GET /me/orgs — the authenticated user's organization memberships.
     * Self-service mirror of getMyApps() / /me/apps. Lets UIs render an
     * org-switcher without admin scope (AUTH-PHP-LARAVEL-DESIGN §5).
     *
     * Returns the raw `organizations` array; consumers map it to their
     * own UI shape. The response shape matches the admin variant so a
     * shared renderer can take either source.
     */
    getMyOrgs(): Promise<MyOrgRecord[]>;
    /** GET /me/invitations — invitations addressed to me. */
    listMyInvitations(): Promise<InvitationRecord[]>;
    /**
     * POST /me/invitations/{id}/accept — join the org. After success
     * call `switchOrg(organizationId)` to scope the active token.
     */
    acceptInvitation(invitationId: string): Promise<Organization | null>;
    /** POST /me/invitations/{id}/decline. */
    declineInvitation(invitationId: string): Promise<void>;
    /**
     * Delete the caller's own account. Calls DELETE /me/account with
     * the user's current password + a typed "DELETE" confirmation
     * (the server enforces both — we don't try to be clever here).
     * On success, the AuthClient's snapshot transitions to anonymous
     * (the access token's tv claim is bumped server-side, refresh row
     * was cascade-deleted with the user row).
     */
    deleteMyAccount(currentPassword: string): Promise<void>;
}
//# sourceMappingURL=account.module.d.ts.map