/**
 * TOTP 2FA enrollment + verification flows (AUDIT C4 — wire-compatible
 * with auth-server's /auth/2fa/{setup,enable,disable}).
 *
 * Lifecycle:
 *
 *   1. setup() → server returns the base32 secret + the
 *      otpauth://totp/... provisioning URI. The consumer renders the URI
 *      as a QR code locally (the SDK doesn't render — that's a UI
 *      concern). The user scans + reads the first 6-digit code from
 *      their authenticator.
 *
 *   2. enable(code) → submits that first code; the server flips
 *      two_factor_confirmed_at and 2FA goes live. Until this call
 *      succeeds, login does NOT require 2FA — a half-finished
 *      enrollment never locks anyone out.
 *
 *   3. disable({password, code}) → requires BOTH a fresh password AND a
 *      current code; the server bumps the user's token-version so every
 *      outstanding access token is invalidated. The SDK transparently
 *      refreshes after this call.
 */

import { ensureOk, type FlowDeps } from './flow-deps.js';

export interface TotpDisableRequest {
    password: string;
    code: string;
}

export class TotpFlow {
    constructor(private readonly deps: FlowDeps) {}

    async setup(): Promise<{ secret: string; provisioningUri: string }> {
        const resp = await this.deps.ports.transport.request<{
            secret: string;
            provisioning_uri: string;
        }>({
            method: 'POST',
            url: `${this.deps.apiBaseUrl}/auth/2fa/setup`,
            body: {},
        });
        await ensureOk(resp);
        return {
            secret: resp.body.secret,
            provisioningUri: resp.body.provisioning_uri,
        };
    }

    async enable(code: string): Promise<void> {
        const resp = await this.deps.ports.transport.request({
            method: 'POST',
            url: `${this.deps.apiBaseUrl}/auth/2fa/enable`,
            body: { code },
        });
        await ensureOk(resp);
    }

    async disable(req: TotpDisableRequest): Promise<void> {
        const resp = await this.deps.ports.transport.request({
            method: 'POST',
            url: `${this.deps.apiBaseUrl}/auth/2fa/disable`,
            body: { password: req.password, code: req.code },
        });
        await ensureOk(resp);
    }
}
