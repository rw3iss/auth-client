// Adapter smoke test — verifies every framework adapter's barrel
// resolves and re-exports the expected named bindings. Catches broken
// imports / typos in re-export paths without needing a full framework
// runtime.
//
// We don't render anything (the test runner is Node without a DOM); we
// only assert that the named exports are present and are functions /
// classes / objects of the right shape. The TypeScript compiler already
// verifies type signatures at build time; this test catches subpath
// export-map regressions at runtime.

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

describe('adapter barrel imports', () => {
    it('core barrel exports the documented surface', async () => {
        const mod = await import('../src/index.js');
        // Sample of every export class — not exhaustive, but covers the
        // pieces a consumer touches first.
        assert.equal(typeof mod.createAuthClient, 'function');
        assert.equal(typeof mod.AuthClient, 'function');
        assert.equal(typeof mod.AuthError, 'function');
        assert.equal(typeof mod.OfflineModeError, 'function');
        assert.equal(typeof mod.LocalStorageTokenStore, 'function');
        assert.equal(typeof mod.MemoryTokenStore, 'function');
        assert.equal(typeof mod.FixedClock, 'function');
        assert.equal(typeof mod.RefreshMutex, 'function');
        assert.equal(typeof mod.generatePKCEPair, 'function');
        assert.equal(typeof mod.deriveS256Challenge, 'function');
        assert.equal(typeof mod.decodeAccessToken, 'function');
        assert.equal(typeof mod.LoginFlow, 'function');
        assert.equal(typeof mod.SsoFlow, 'function');
        assert.equal(typeof mod.DEFAULTS, 'object');
        assert.equal(mod.DEFAULTS.bootstrap, 'auto');
    });

    it('react adapter barrel exports hooks + AuthProvider', async () => {
        const mod = await import('../src/framework-adapters/react/index.js');
        assert.equal(typeof mod.AuthProvider, 'function');
        assert.equal(typeof mod.useAuthClient, 'function');
        assert.equal(typeof mod.useAuth, 'function');
        assert.equal(typeof mod.useUser, 'function');
        assert.equal(typeof mod.useAuthStatus, 'function');
        assert.equal(typeof mod.useIsAuthenticated, 'function');
        assert.equal(typeof mod.useAuthReady, 'function');
        assert.equal(typeof mod.useLogin, 'function');
        assert.equal(typeof mod.useRegister, 'function');
        assert.equal(typeof mod.useLogout, 'function');
        assert.equal(typeof mod.useLogoutAll, 'function');
        assert.equal(typeof mod.useStartSso, 'function');
        assert.equal(typeof mod.useCompleteSso, 'function');
        assert.equal(typeof mod.useRefreshTokens, 'function');
        assert.equal(typeof mod.useWhoami, 'function');
        assert.equal(typeof mod.useSetupTwoFactor, 'function');
        assert.equal(typeof mod.useEnableTwoFactor, 'function');
        assert.equal(typeof mod.useDisableTwoFactor, 'function');
        assert.equal(typeof mod.useImpersonate, 'function');
        assert.equal(typeof mod.useHardDeleteUser, 'function');
    });

    it('preact adapter barrel exports same surface as react', async () => {
        const mod = await import('../src/framework-adapters/preact/index.js');
        // Same named exports — Preact adapter API mirrors React.
        for (const name of [
            'AuthProvider', 'useAuthClient', 'useAuth', 'useUser',
            'useAuthStatus', 'useIsAuthenticated', 'useAuthReady',
            'useLogin', 'useRegister', 'useLogout', 'useLogoutAll',
            'useStartSso', 'useCompleteSso', 'useRefreshTokens', 'useWhoami',
            'useSetupTwoFactor', 'useEnableTwoFactor', 'useDisableTwoFactor',
            'useImpersonate', 'useHardDeleteUser',
        ]) {
            assert.equal(
                typeof (mod as Record<string, unknown>)[name],
                'function',
                `preact adapter missing export: ${name}`,
            );
        }
    });

    it('solid adapter barrel exports useAuth + create* factories', async () => {
        const mod = await import('../src/framework-adapters/solid/index.js');
        for (const name of [
            'AuthProvider', 'useAuthClient', 'useAuth', 'useUser',
            'useAuthStatus', 'useIsAuthenticated', 'useAuthReady',
            'createLogin', 'createRegister', 'createLogout', 'createLogoutAll',
            'createStartSso', 'createCompleteSso', 'createRefreshTokens',
            'createWhoami', 'createSetupTwoFactor', 'createEnableTwoFactor',
            'createDisableTwoFactor', 'createImpersonate', 'createHardDeleteUser',
        ]) {
            assert.equal(
                typeof (mod as Record<string, unknown>)[name],
                'function',
                `solid adapter missing export: ${name}`,
            );
        }
    });

    it('vue adapter barrel exports AuthPlugin + composables', async () => {
        const mod = await import('../src/framework-adapters/vue/index.js');
        // AuthPlugin is an object with install() function — Vue's
        // plugin contract.
        assert.equal(typeof mod.AuthPlugin, 'object');
        assert.equal(typeof mod.AuthPlugin.install, 'function');
        assert.equal(typeof mod.AUTH_INJECTION_KEY, 'symbol');
        for (const name of [
            'useAuth', 'useAuthClient', 'useUser', 'useAuthStatus',
            'useIsAuthenticated', 'useAuthReady',
            'useLogin', 'useRegister', 'useLogout', 'useLogoutAll',
            'useStartSso', 'useCompleteSso', 'useRefreshTokens', 'useWhoami',
            'useSetupTwoFactor', 'useEnableTwoFactor', 'useDisableTwoFactor',
            'useImpersonate', 'useHardDeleteUser',
        ]) {
            assert.equal(
                typeof (mod as Record<string, unknown>)[name],
                'function',
                `vue adapter missing export: ${name}`,
            );
        }
    });

    it('astro adapter barrel exports server helper', async () => {
        const mod = await import('../src/framework-adapters/astro/index.js');
        assert.equal(typeof mod.getServerAuth, 'function');
    });
});
