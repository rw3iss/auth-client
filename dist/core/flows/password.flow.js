/**
 * Password lifecycle flows:
 *
 *   - `requestReset(email)` — anonymous; sends a single-use reset link
 *     to `email`. Server returns 200 regardless of whether the email
 *     exists, to prevent enumeration.
 *
 *   - `reset(token, newPassword)` — anonymous; consumes the token from
 *     the reset email and sets the new password. Token is single-use
 *     (audit 1.1) — the server invalidates it after consumption.
 *
 *   - `change(currentPassword, newPassword)` — authenticated; rotates
 *     the password for the currently-signed-in user. Server requires
 *     the current password as a defense against session-hijack attacks.
 *
 * None of these mutate the AuthClient's token state. `change()` is the
 * only one that requires an existing session; the others run from
 * anonymous flows (reset-email landing pages).
 */
import { ensureOk } from './flow-deps.js';
export class PasswordFlow {
    deps;
    constructor(deps) {
        this.deps = deps;
    }
    /**
     * POST /auth/password/reset-request — anonymous; 200 regardless of
     * whether the email is registered (anti-enumeration).
     */
    async requestReset(req) {
        const resp = await this.deps.ports.transport.request({
            method: 'POST',
            url: `${this.deps.apiBaseUrl}/auth/password/reset-request`,
            body: {
                email: req.email,
                ...(req.appCode && { app_code: req.appCode }),
            },
        });
        await ensureOk(resp);
    }
    /**
     * POST /auth/password/reset — anonymous; consumes the single-use
     * token from the reset email. After success, the user can log in
     * with the new password (no token pair is returned by this call —
     * it's a credential change, not a session establishment).
     */
    async reset(req) {
        const resp = await this.deps.ports.transport.request({
            method: 'POST',
            url: `${this.deps.apiBaseUrl}/auth/password/reset`,
            body: { token: req.token, new_password: req.newPassword },
        });
        await ensureOk(resp);
    }
    /**
     * POST /auth/password/change — authenticated. Server verifies the
     * current password before applying the change. On success, the
     * caller's existing token-pair remains valid; other devices keep
     * their sessions unless the caller follows up with logout-all.
     */
    async change(req) {
        const resp = await this.deps.ports.transport.request({
            method: 'POST',
            url: `${this.deps.apiBaseUrl}/auth/password/change`,
            body: {
                current_password: req.currentPassword,
                new_password: req.newPassword,
            },
        });
        await ensureOk(resp);
    }
}
//# sourceMappingURL=password.flow.js.map