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

export class AccountModule {
    constructor(private readonly ctx: ModuleContext) {}

    /**
     * Request a password-reset email. Server returns 200 regardless of
     * whether the email exists (anti-enumeration). Anonymous flow.
     */
    async requestPasswordReset(email: string, appCode?: string): Promise<void> {
        this.ctx.guard('requestPasswordReset');
        await this.ctx.flows.password.requestReset({ email, ...(appCode && { appCode }) });
    }

    /**
     * Reset a password using a single-use token from the reset email.
     * After success, the user must log in normally with the new password.
     * Anonymous flow — no existing session required.
     */
    async resetPassword(token: string, newPassword: string): Promise<void> {
        this.ctx.guard('resetPassword');
        await this.ctx.flows.password.reset({ token, newPassword });
    }

    /**
     * Change the password for the currently-signed-in user. Server
     * verifies the current password before applying the change.
     * Authenticated flow — caller must be signed in.
     */
    async changePassword(currentPassword: string, newPassword: string): Promise<void> {
        this.ctx.guard('changePassword');
        await this.ctx.flows.password.change({ currentPassword, newPassword });
    }

    /** Consume a single-use email-verification token from the verify email. */
    async verifyEmail(token: string): Promise<void> {
        this.ctx.guard('verifyEmail');
        await this.ctx.flows.emailVerification.verify({ token });
    }

    /** Re-issue a verification email. Always succeeds (anti-enumeration). */
    async resendVerificationEmail(email: string, appCode?: string): Promise<void> {
        this.ctx.guard('resendVerificationEmail');
        await this.ctx.flows.emailVerification.resend({ email, ...(appCode && { appCode }) });
    }

    /** Begin TOTP enrollment. Returns the provisioning URI + base32 secret
     * for the consumer to render as a QR code. */
    async setupTwoFactor(): Promise<{ secret: string; provisioningUri: string }> {
        this.ctx.guard('setupTwoFactor');
        return this.ctx.flows.totp.setup();
    }

    /** Submit the first TOTP code to complete enrollment. */
    async enableTwoFactor(code: string): Promise<void> {
        this.ctx.guard('enableTwoFactor');
        await this.ctx.flows.totp.enable(code);
    }

    /** Turn 2FA off — requires the current password + a fresh code. */
    async disableTwoFactor(params: { password: string; code: string }): Promise<void> {
        return this.ctx.core.disableTwoFactor(params);
    }

    /**
     * GET /me/orgs — the authenticated user's organization memberships.
     * Self-service mirror of getMyApps() / /me/apps. Lets UIs render an
     * org-switcher without admin scope (AUTH-PHP-LARAVEL-DESIGN §5).
     *
     * Returns the raw `organizations` array; consumers map it to their
     * own UI shape. The response shape matches the admin variant so a
     * shared renderer can take either source.
     */
    async getMyOrgs(): Promise<MyOrgRecord[]> {
        return this.ctx.core.getMyOrgs();
    }

    /** GET /me/invitations — invitations addressed to me. */
    async listMyInvitations(): Promise<InvitationRecord[]> {
        this.ctx.guard('listMyInvitations');
        return this.ctx.flows.org.listMyInvitations();
    }

    /**
     * POST /me/invitations/{id}/accept — join the org. After success
     * call `switchOrg(organizationId)` to scope the active token.
     */
    async acceptInvitation(invitationId: string): Promise<Organization | null> {
        this.ctx.guard('acceptInvitation');
        return this.ctx.flows.org.acceptMyInvitation(invitationId);
    }

    /** POST /me/invitations/{id}/decline. */
    async declineInvitation(invitationId: string): Promise<void> {
        this.ctx.guard('declineInvitation');
        await this.ctx.flows.org.declineMyInvitation(invitationId);
    }

    /**
     * Delete the caller's own account. Calls DELETE /me/account with
     * the user's current password + a typed "DELETE" confirmation
     * (the server enforces both — we don't try to be clever here).
     * On success, the AuthClient's snapshot transitions to anonymous
     * (the access token's tv claim is bumped server-side, refresh row
     * was cascade-deleted with the user row).
     */
    async deleteMyAccount(currentPassword: string): Promise<void> {
        return this.ctx.core.deleteMyAccount(currentPassword);
    }
}
