/**
 * SSO flow with PKCE (AUDIT C2 — wire-compatible with the auth-server
 * implementation in internal/auth/sso/).
 *
 * Two phases:
 *
 *   1. start(): generates a PKCE pair, persists the verifier (so the
 *      eventual callback can redeem it even across page reloads), POSTs
 *      to /auth/sso/url, and returns the provider's authorization URL +
 *      state for the browser to navigate to.
 *
 *   2. complete(): handles the callback. POSTs to /auth/sso/callback;
 *      the server returns either:
 *        a. {auth_code, expires_in} — PKCE was in flight. The SDK
 *           automatically exchanges via /auth/sso/exchange with the
 *           persisted verifier, returns the final token pair.
 *        b. {user, tokens, …} — PKCE was not in flight (non-PKCE flow).
 *           Pass-through.
 *
 * Persistence of the verifier in Storage means a redirect dance survives
 * a full-page navigation: tab opens → start() → navigate to provider →
 * provider redirects back → complete() reads the verifier and finishes.
 */
import { generatePKCEPair } from '../pkce.js';
import { ensureOk } from './flow-deps.js';
const VERIFIER_STORAGE_KEY = 'sso:pkce_verifier';
const STATE_STORAGE_KEY = 'sso:state';
export class SsoFlow {
    deps;
    constructor(deps) {
        this.deps = deps;
    }
    async start(req) {
        // Generate a fresh PKCE pair. Persist the verifier so complete()
        // can read it back after the redirect dance.
        const { verifier, challenge, method } = await generatePKCEPair(this.deps.ports.crypto);
        const body = {
            provider: req.provider,
            redirect_url: req.redirectUrl,
            code_challenge: challenge,
            code_challenge_method: method,
        };
        if (req.organizationId !== undefined)
            body['organization_id'] = req.organizationId;
        if (req.inviteCode !== undefined)
            body['invite_code'] = req.inviteCode;
        const resp = await this.deps.ports.transport.request({
            method: 'POST',
            url: `${this.deps.apiBaseUrl}/auth/sso/url`,
            body,
            skipAuth: true,
        });
        await ensureOk(resp);
        await this.deps.ports.storage.set(VERIFIER_STORAGE_KEY, verifier);
        await this.deps.ports.storage.set(STATE_STORAGE_KEY, resp.body.state);
        return {
            authUrl: resp.body.auth_url,
            state: resp.body.state,
            codeVerifier: verifier,
        };
    }
    /**
     * Enabled SSO providers for this deployment, lower-cased names
     * (e.g. `['google', 'github']`). Public + auth-free. Returns `[]`
     * gracefully on any failure (offline, 4xx/5xx) so callers can hide
     * their SSO UI rather than show buttons that can't work.
     */
    async getEnabledProviders() {
        try {
            const resp = await this.deps.ports.transport.request({
                method: 'GET',
                url: `${this.deps.apiBaseUrl}/auth/sso/providers`,
                skipAuth: true,
            });
            if (!resp.ok || !Array.isArray(resp.body))
                return [];
            return resp.body
                .filter((p) => p && p.enabled !== false && typeof p.name === 'string')
                .map((p) => p.name.toLowerCase());
        }
        catch {
            return [];
        }
    }
    async complete(req) {
        // Defensive: confirm the returning state matches what we
        // persisted. The server already validates state atomically;
        // this is a belt-and-suspenders check against a redirect-to-the-
        // wrong-tab scenario.
        const expected = await this.deps.ports.storage.get(STATE_STORAGE_KEY);
        if (expected !== null && expected !== req.state) {
            throw new Error('SSO state mismatch — refusing to exchange');
        }
        const body = { code: req.code, state: req.state };
        if (req.provider !== undefined)
            body['provider'] = req.provider;
        const callbackResp = await this.deps.ports.transport.request({
            method: 'POST',
            url: `${this.deps.apiBaseUrl}/auth/sso/callback`,
            body,
            skipAuth: true,
        });
        await ensureOk(callbackResp);
        // PKCE path: server returned an auth_code instead of tokens.
        // Exchange it with the persisted verifier.
        if (isAuthCodeResponse(callbackResp.body)) {
            const verifier = await this.deps.ports.storage.get(VERIFIER_STORAGE_KEY);
            if (!verifier) {
                throw new Error('PKCE verifier not found in storage — SSO start() must run in the same browser/profile');
            }
            const exchangeResp = await this.deps.ports.transport.request({
                method: 'POST',
                url: `${this.deps.apiBaseUrl}/auth/sso/exchange`,
                body: {
                    auth_code: callbackResp.body.auth_code,
                    code_verifier: verifier,
                },
                skipAuth: true,
            });
            await ensureOk(exchangeResp);
            // Clean up the persisted PKCE artefacts — verifier is
            // one-shot just like the auth_code it redeemed.
            await this.clearPersistedPkce();
            return exchangeResp.body;
        }
        // Non-PKCE path: tokens are already in the callback response.
        await this.clearPersistedPkce();
        return callbackResp.body;
    }
    async clearPersistedPkce() {
        await this.deps.ports.storage.remove(VERIFIER_STORAGE_KEY);
        await this.deps.ports.storage.remove(STATE_STORAGE_KEY);
    }
}
function isAuthCodeResponse(body) {
    if (typeof body !== 'object' || body === null)
        return false;
    const b = body;
    return typeof b.auth_code === 'string';
}
//# sourceMappingURL=sso.flow.js.map