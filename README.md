# @rw3iss/auth-client

📚 **Full documentation**: [docs.auth.ryanweiss.net](https://docs.auth.ryanweiss.net/auth-client/overview/)

Framework-agnostic browser SDK for [`@rw3iss/auth-server`](../auth-server). Vanilla TypeScript core with first-class adapters for **React, Preact, SolidJS, Vue, and Astro**. Hexagonal architecture — every external dependency is an injectable port with a browser-native default. Designed to compose into the broader rw3iss marketplace SDK.

---

## Highlights

- **Same API everywhere.** Every adapter exposes the same logical surface (`useAuth`, `useLogin`, `useStartSso`, …) — switching frameworks is a one-line import change.
- **Three bootstrap modes.**
  - `auto` (default): proactively validates the cached session against `/auth/me` at boot. UIs gate their first render on `ready()`.
  - `lazy`: trusts cached claims, defers validation until the first failed request.
  - `offline`: inert mode. Flow methods throw `OfflineModeError`; read-state methods return null/false. Useful for static demos, Storybook, styleguides.
- **Auto-retry on 401.** `authenticatedRequest()` refreshes under a mutex and retries once. Refresh failure clears state + emits `session_expired`.
- **Cross-tab session sync.** BroadcastChannel keeps every tab consistent — log in one tab, every tab updates.
- **Refresh-mutex coalescing.** A burst of N concurrent requests just-before-expiry triggers ONE refresh, not N. Prevents tripping the auth-server's family-revoke detector (AUDIT 1.9).
- **Pluggable everything.** Token store, transport, storage, clock, crypto, logger, broadcast — each is a port. Swap any for SSR, HttpOnly cookies, custom retry, instrumented tests.
- **Wire-compatible with every server feature.** Password + SSO/PKCE (C2), TOTP 2FA (C4), refresh-rotation (1.9), dual-secret rotation (C5), impersonation (C7), hard-delete (C8), per-user token-version (1.10), org / app context switching.
- **20+ unit tests** cover the pure-logic surface (PKCE round-trip, refresh-mutex coalescing, JWT decode, event-bus isolation, bootstrap state machine).

---

## Install

```bash
pnpm add @rw3iss/auth-client
# Plus your framework of choice (peer dep):
pnpm add react           # OR preact, solid-js, vue
```

---

## Quick start (vanilla)

```ts
import { createAuthClient } from '@rw3iss/auth-client';

const auth = createAuthClient({
    apiBaseUrl: 'https://auth.ryanweiss.net/api/v1',
    appCode: 'marketplace-buyer',
    bootstrap: 'auto', // default — validates cached session at boot
});

// Wait for the initial check.
await auth.ready();

if (auth.isAuthenticated()) {
    console.log('signed in as', auth.getCurrentUser());
} else {
    await auth.auth.login({ email: 'a@b.com', password: 'hunter2' });
}

// Subscribe to lifecycle events.
auth.on('logged_out', () => router.push('/login'));
auth.on('token_refreshed', () => analytics.event('session_extended'));
```

### The module API

The SDK surface is organized into **namespaced modules** — stateless
groups of methods over the one client core, which owns all auth
context, token storage and refresh:

| Module | Purpose |
|---|---|
| `client.auth` | login (password / SSO / magic link), register, logout(-all), refresh, switchOrg, whoami, identity getters |
| `client.account` | own password / email verification / 2FA / org memberships / invitations / delete-my-account |
| `client.sessions` | own device sessions (list / terminate) |
| `client.users` | admin: list, lookup, base roles, set-password, session control, impersonate, hard delete |
| `client.organizations` | org CRUD, members (self-service + admin paths), custom roles, invitations |
| `client.apps` | application registry (pools, policy, webhooks) + per-user access grants |
| `client.services` | m2m machine-credential registry (system_admin) |
| `client.pools` | user pools (namespaces) catalog + per-user pool management |
| `client.audit` | platform audit log |

```ts
await auth.organizations.addMember(orgId, userId);
await auth.apps.update(appId, { webhooks: [...] });
const pools = await auth.pools.list();
```

As of **v0.3.0** the modules OWN the endpoint implementations — the
old flat endpoint methods (`auth.listApps()`, `auth.adminAddOrgMember()`,
…) are **removed** from AuthClient. The core keeps only the session
engine: lifecycle/state (`ready`, `getSnapshot`, `subscribe`,
`authenticatedRequest`, `destroy`) and the session-mutating operations
(`loginWithPassword`, `register`, `logoutCurrent/All`,
`refreshAccessToken`, `switchOrg`, SSO/magic-link completion,
`impersonate`, `deleteMyAccount`) which `client.auth` /
`client.account` / `client.users` surface. Framework hooks
(`useListApps()`, …) are unaffected — they were rewired internally.

---

## Framework adapters

Each adapter wraps the core in framework-idiomatic primitives. APIs are intentionally parallel — same hook/composable names, same state shapes — so an app that switches frameworks is a near-mechanical port.

<details>
<summary><strong>React</strong></summary>

```tsx
// app.tsx
import { createAuthClient } from '@rw3iss/auth-client';
import { AuthProvider, useAuth, useLogin } from '@rw3iss/auth-client/react';

const auth = createAuthClient({
    apiBaseUrl: 'https://auth.ryanweiss.net/api/v1',
    appCode: 'marketplace-buyer',
});

export function App() {
    return (
        <AuthProvider client={auth}>
            <Shell />
        </AuthProvider>
    );
}

function Shell() {
    const { user, ready, status } = useAuth();
    if (!ready) return <Splash />;
    return user ? <Dashboard /> : <LoginForm />;
}

function LoginForm() {
    const login = useLogin();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [code, setCode] = useState('');

    return (
        <form
            onSubmit={async (e) => {
                e.preventDefault();
                const r = await login.run({ email, password, twoFactorCode: code || undefined });
                if (r.requires_2fa) {
                    /* Show TOTP input — submitting again with code populated will succeed. */
                }
            }}
        >
            <input value={email} onChange={(e) => setEmail(e.target.value)} />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            {login.error && <p>{login.error.message}</p>}
            <button disabled={login.loading}>{login.loading ? 'Signing in…' : 'Sign in'}</button>
        </form>
    );
}
```

Hooks available (`@rw3iss/auth-client/react`):

- State: `useAuth`, `useUser`, `useAuthStatus`, `useAuthReady`, `useIsAuthenticated`, `useAuthClient`
- Actions: `useLogin`, `useRegister`, `useLogout`, `useLogoutAll`, `useStartSso`, `useCompleteSso`, `useRefreshTokens`, `useWhoami`, `useSetupTwoFactor`, `useEnableTwoFactor`, `useDisableTwoFactor`, `useImpersonate`, `useHardDeleteUser`

Every action hook returns `{ run, data, error, loading, isIdle, reset }`. `run()` returns the underlying promise so you can `await` it.

</details>

<details>
<summary><strong>Preact</strong></summary>

API is identical to the React adapter — uses `preact/hooks` + `preact/compat`'s `useSyncExternalStore` instead of React's. If your project uses `preact/compat` to alias `react → preact`, the React adapter also works; the dedicated Preact adapter avoids that alias dance.

```tsx
// app.tsx
import { createAuthClient } from '@rw3iss/auth-client';
import { AuthProvider, useAuth, useLogin } from '@rw3iss/auth-client/preact';

const auth = createAuthClient({
    apiBaseUrl: 'https://auth.ryanweiss.net/api/v1',
    appCode: 'marketplace-buyer',
});

export function App() {
    return (
        <AuthProvider client={auth}>
            <Shell />
        </AuthProvider>
    );
}

function Shell() {
    const { user, ready } = useAuth();
    if (!ready) return <Splash />;
    return user ? <Dashboard /> : <LoginForm />;
}

function LoginForm() {
    const login = useLogin();
    return (
        <form
            onSubmit={async (e) => {
                e.preventDefault();
                const data = new FormData(e.currentTarget);
                await login.run({
                    email: data.get('email') as string,
                    password: data.get('password') as string,
                });
            }}
        >
            <input name="email" />
            <input name="password" type="password" />
            <button disabled={login.loading}>{login.loading ? 'Signing in…' : 'Sign in'}</button>
            {login.error && <p>{login.error.message}</p>}
        </form>
    );
}
```

Hooks available (`@rw3iss/auth-client/preact`): same names as React.

</details>

<details>
<summary><strong>SolidJS</strong></summary>

Solid's fine-grained reactivity — state hooks return Accessors (`user()`, not `user`). Action factories use the `create*` prefix matching `createSignal` / `createEffect`.

```tsx
// app.tsx
import { Show } from 'solid-js';
import { createAuthClient } from '@rw3iss/auth-client';
import { AuthProvider, useAuth, createLogin } from '@rw3iss/auth-client/solid';

const auth = createAuthClient({
    apiBaseUrl: 'https://auth.ryanweiss.net/api/v1',
    appCode: 'marketplace-buyer',
});

export function App() {
    return (
        <AuthProvider client={auth}>
            <Shell />
        </AuthProvider>
    );
}

function Shell() {
    const { user, ready } = useAuth();
    return (
        <Show when={ready()} fallback={<Splash />}>
            <Show when={user()} fallback={<LoginForm />}>
                <Dashboard />
            </Show>
        </Show>
    );
}

function LoginForm() {
    const login = createLogin();
    return (
        <form
            onSubmit={async (e) => {
                e.preventDefault();
                const data = new FormData(e.currentTarget);
                await login.run({
                    email: data.get('email') as string,
                    password: data.get('password') as string,
                });
            }}
        >
            <input name="email" />
            <input name="password" type="password" />
            <button disabled={login.loading()}>{login.loading() ? 'Signing in…' : 'Sign in'}</button>
            <Show when={login.error()}>{(err) => <p>{err().message}</p>}</Show>
        </form>
    );
}
```

Available (`@rw3iss/auth-client/solid`):

- State: `useAuth`, `useUser`, `useAuthStatus`, `useAuthReady`, `useIsAuthenticated`, `useAuthClient`
- Actions: `createLogin`, `createRegister`, `createLogout`, `createLogoutAll`, `createStartSso`, `createCompleteSso`, `createRefreshTokens`, `createWhoami`, `createSetupTwoFactor`, `createEnableTwoFactor`, `createDisableTwoFactor`, `createImpersonate`, `createHardDeleteUser`

</details>

<details>
<summary><strong>Vue 3</strong></summary>

Plugin-based DI. State composables return `ComputedRef`; action composables expose individual reactive refs (`action.loading.value` etc.) so templates can bind directly.

```ts
// main.ts
import { createApp } from 'vue';
import { createAuthClient } from '@rw3iss/auth-client';
import { AuthPlugin } from '@rw3iss/auth-client/vue';
import App from './App.vue';

const auth = createAuthClient({
    apiBaseUrl: 'https://auth.ryanweiss.net/api/v1',
    appCode: 'marketplace-buyer',
});

createApp(App).use(AuthPlugin, { client: auth }).mount('#app');
```

```vue
<!-- Shell.vue -->
<script setup lang="ts">
import { useAuth } from '@rw3iss/auth-client/vue';
const { user, ready } = useAuth();
</script>

<template>
    <Splash v-if="!ready" />
    <Dashboard v-else-if="user" />
    <LoginForm v-else />
</template>
```

```vue
<!-- LoginForm.vue -->
<script setup lang="ts">
import { ref } from 'vue';
import { useLogin } from '@rw3iss/auth-client/vue';

const login = useLogin();
const email = ref('');
const password = ref('');

async function submit() {
    await login.run({ email: email.value, password: password.value });
}
</script>

<template>
    <form @submit.prevent="submit">
        <input v-model="email" />
        <input v-model="password" type="password" />
        <button :disabled="login.loading.value">
            {{ login.loading.value ? 'Signing in…' : 'Sign in' }}
        </button>
        <p v-if="login.error.value">{{ login.error.value.message }}</p>
    </form>
</template>
```

Available (`@rw3iss/auth-client/vue`):

- Plugin: `AuthPlugin`
- State: `useAuth`, `useUser`, `useAuthStatus`, `useAuthReady`, `useIsAuthenticated`, `useAuthClient`
- Actions: `useLogin`, `useRegister`, `useLogout`, `useLogoutAll`, `useStartSso`, `useCompleteSso`, `useRefreshTokens`, `useWhoami`, `useSetupTwoFactor`, `useEnableTwoFactor`, `useDisableTwoFactor`, `useImpersonate`, `useHardDeleteUser`

</details>

<details>
<summary><strong>Astro</strong></summary>

Two layers:

1. **Server-side** — `getServerAuth(request, config)` in `.astro` front-matter reads the access token from a cookie and (optionally) validates against `/auth/me`. Use for SSR auth gating + initial user data.
2. **Client islands** — for interactive components, pair with any framework adapter above (React, Preact, Solid, Vue) inside an Astro island.

```astro
---
// src/pages/dashboard.astro
import { getServerAuth } from '@rw3iss/auth-client/astro';

const auth = await getServerAuth(Astro.request, {
    apiBaseUrl: import.meta.env.AUTH_API_URL,
    cookieName: 'rw3iss_access_token',
    validateOnServer: true, // hit /auth/me to confirm server-side validity
});

if (!auth.isAuthenticated) {
    return Astro.redirect('/login');
}
---

<h1>Welcome, {auth.user?.email}</h1>

<!-- Client island for interactive parts. -->
<DashboardIsland user={auth.user} client:load />
```

```tsx
// src/components/DashboardIsland.tsx (a Solid island; same shape for React/Preact/Vue)
import { createAuthClient } from '@rw3iss/auth-client';
import { AuthProvider, useAuth, createLogout } from '@rw3iss/auth-client/solid';

const auth = createAuthClient({
    apiBaseUrl: import.meta.env.PUBLIC_AUTH_API_URL,
    appCode: 'marketplace-buyer',
});

export default function DashboardIsland() {
    return (
        <AuthProvider client={auth}>
            <Inside />
        </AuthProvider>
    );
}

function Inside() {
    const { user } = useAuth();
    const logout = createLogout();
    return (
        <>
            <p>Hello, {user()?.email}</p>
            <button onClick={() => logout.run()}>Sign out</button>
        </>
    );
}
```

Note: for HttpOnly cookies the server adapter validates without needing JS-readable tokens. For localStorage-based auth (the default), Astro pages still render as anonymous unless the client island first hydrates and reads from localStorage — this is a hydration choice; tune `bootstrap: 'auto'` (network roundtrip) vs `'lazy'` (instant render, trust cache).

</details>

---

## Preact UI components

In addition to the headless hooks (`useLogin`, `useRegister`, …), the Preact adapter ships a tree-shakeable library of ready-to-use UI components covering every common auth surface. Tree-shake-friendly — import only what you need.

```ts
// Atoms (single-purpose primitives)
import {
    AuthStatusBadge, UserAvatar, UserMenu,
    LogoutButton, LogoutAllButton,
    SsoButton, SignInWithGoogleButton, SsoButtonGroup,
    ProtectedRoute, GuestOnly, RoleGate, PermissionGate,
    AuthLoading, TokenExpiryCountdown,
} from '@rw3iss/auth-client/preact/ui/atoms';

// Forms / views
import {
    LoginForm, RegisterForm,
    PasswordResetRequestForm, PasswordResetForm, ChangePasswordForm,
    EmailVerificationNotice,
    TwoFactorEnrollment, TwoFactorDisableForm,
    SessionsList, UserProfileCard, OrgSwitcher, UserLookupTable,
} from '@rw3iss/auth-client/preact/ui/forms';

// Full-screen end-to-end flows
import {
    CompleteLoginFlow, CompleteSignupFlow,
    CompletePasswordResetFlow, CompleteAccountSecurityFlow,
    CompleteSsoCallbackFlow, CompleteEmailVerificationFlow,
    CompleteImpersonationFlow,
} from '@rw3iss/auth-client/preact/ui/flows';

// CompleteEmailVerificationFlow — mount on /auth/verify-email (the route the
// server's verification emails link to, built from the app's `frontend_url`).
// Reads `?token=` from the URL, exchanges it on mount, renders
// verifying / success / error / missing-token states; `continueHref`
// links onward (e.g. to your sign-in route).

// Or import everything at once:
import { LoginForm, CompleteLoginFlow } from '@rw3iss/auth-client/preact/ui';
```

Every component is a thin layer over the core SDK — they call the same `useLogin`/`useRegister`/etc. hooks the headless API exposes. State, error surfacing, and snapshot reactivity all flow through `AuthClient`; the UI components add only markup + minimal local state. That means you can mix them freely with your own custom forms in the same app.

Styling reads from CSS variables (`--vauth-color-primary`, `--vauth-radius`, etc.) so you can re-theme without touching component code. The reference stylesheet ships with the package:

```ts
// Anywhere in your app bootstrap (Vite / webpack / Astro / Next):
import '@rw3iss/auth-client/styles';            // tokens + components
// Or, granular:
import '@rw3iss/auth-client/styles/tokens';     // only the CSS variable defaults
import '@rw3iss/auth-client/styles/components'; // only the .vauth-* selectors
```

Re-theme by overriding any `--vauth-*` variable at any scope (`:root`, a wrapper class, a single page). The stylesheets touch only the `.vauth-*` classes — they don't reset `html` / `body` / `*`, so they coexist with any host theme.

The demo site at [`rw3iss/auth-client-demo`](https://github.com/rw3iss/auth-client-demo) renders every component live with copy-paste snippets — start there to see what each one looks like and how to integrate it.

---

## Configuration

```ts
const auth = createAuthClient({
    /** Required. */
    apiBaseUrl: 'https://auth.ryanweiss.net/api/v1',

    /** App scoping — required by auth-server unless AUTH_ALLOW_BASE_USER_LOGIN is set. */
    appCode: 'marketplace-buyer',

    /** Storage namespace prefix. Default 'rw3iss_auth'. */
    storageNamespace: 'marketplace_buyer_auth',

    /** Seconds before expiry to preemptively refresh. Default 60. */
    refreshLeewaySeconds: 60,

    /** Attach Authorization: Bearer to outgoing fetch calls. Default true.
     * Disable for cookie-based auth. */
    attachAuthHeader: true,

    /** BroadcastChannel-based cross-tab sync. Default true. */
    enableCrossTabSync: true,

    /** Bootstrap strategy at construction time:
     *   - 'auto' (default): proactively validate via /auth/me
     *   - 'lazy': trust cached claims, defer validation
     *   - 'offline': inert mode, all flow methods throw OfflineModeError
     */
    bootstrap: 'auto',

    /** Auto-refresh + retry once on 401 (via authenticatedRequest). Default true. */
    autoRetryOn401: true,

    /** Override default ports — useful for SSR / HttpOnly cookies / tests. */
    ports: {
        // tokenStore: new MyHttpOnlyCookieTokenStore(),
        // transport: new MyRetryWrappingTransport(),
        // logger: new MyStructuredLogger(),
    },
});
```

### Bootstrap modes in depth

| Mode | When to use | Cost | Trade-off |
|---|---|---|---|
| `auto` | Default. Production apps where correctness > startup latency. | One `/auth/me` roundtrip at construction. | First render delayed until `ready()` resolves. |
| `lazy` | High-traffic edges where the auth roundtrip would dominate TTI. | None at construction. | Might briefly render an authenticated UI for a tick before the first protected call fails. |
| `offline` | Demos, Storybook, styleguides, anonymous-only deployments. | None. | All flow methods throw `OfflineModeError`. |

### Port swapping recipes

**HttpOnly cookies** (server-set, JS-invisible access token):

```ts
import type { TokenStore } from '@rw3iss/auth-client';

class CookieTokenStore implements TokenStore {
    async get() {
        // Server sets Set-Cookie; SDK knows "we have a session" via /auth/me probe.
        const me = await fetch('/auth/me');
        if (!me.ok) return null;
        return { access_token: '', refresh_token: '', expires_at_seconds: 0 };
    }
    async set() { /* no-op — server controls the cookie. */ }
    async clear() { await fetch('/auth/logout', { method: 'POST' }); }
}

const auth = createAuthClient({
    apiBaseUrl: '…',
    attachAuthHeader: false, // server reads cookie, not Bearer
    ports: { tokenStore: new CookieTokenStore() },
});
```

**SSR / Node**:

```ts
import { createAuthClient, MemoryTokenStore, MemoryStorage } from '@rw3iss/auth-client';

const auth = createAuthClient({
    apiBaseUrl: '…',
    bootstrap: 'lazy', // skip /auth/me on every SSR request
    ports: {
        tokenStore: new MemoryTokenStore(),
        storage: new MemoryStorage(),
    },
});
```

**Tests** (deterministic clock, instrumented transport):

```ts
import { FixedClock, MemoryTokenStore, MemoryStorage, type Transport } from '@rw3iss/auth-client';

const transport: Transport = {
    async request(req) { /* return canned responses keyed on req.url */ },
};

const auth = createAuthClient({
    apiBaseUrl: '…',
    bootstrap: 'lazy',
    ports: {
        transport,
        clock: new FixedClock(1_700_000_000),
        tokenStore: new MemoryTokenStore(),
        storage: new MemoryStorage(),
    },
});
```

---

## Events

`AuthClient` emits a typed discriminated union; subscribers register via `client.on(type, handler)`.

| Event | Payload | Fires when |
|---|---|---|
| `authenticated` | `{ user, tokens }` | Login / SSO / impersonation / register-with-tokens succeeded |
| `logged_out` | `{ reason }` | logoutCurrent / logoutAll / cross-tab logout / session-expired |
| `token_refreshed` | `{ tokens }` | Refresh rotation rolled over |
| `requires_two_factor` | `{ email }` | Login response carried `requires_2fa: true` |
| `session_expired` | — | Refresh attempted but the refresh token was already revoked |
| `status_changed` | `{ status, snapshot }` | Lifecycle status transitioned (bootstrapping → authenticated / anonymous / offline) |
| `error` | `{ error }` | Background failure (e.g., async refresh) |

---

## M2M clients admin (the "Services" registry)

Back-office surface for the auth-server's machine-credential registry
(`/admin/m2m-clients` — **system_admin only**). M2M clients are
deliberately separate from the apps registry: apps are user-facing
login surfaces issuing *user* tokens; m2m clients mint *service*
tokens (`token_type: "service"`) for backend-to-backend calls.

```ts
const clients = await auth.services.list();            // M2MClientRecord[]
const { client, client_secret } = await auth.services.create({
    client_id: 'claimleo-svc',
    name: 'ClaimLeo backend',
    scopes: ['gsku:publish'],
});
// ⚠ client_secret is visible exactly ONCE — surface it, then drop it.
await auth.services.revoke(client.id);                  // soft-revoke
```

Preact hooks: `useListM2MClients`, `useGetM2MClient`,
`useCreateM2MClient`, `useRevokeM2MClient`. Types
(`M2MClientRecord`, `CreateM2MClientRequest/Response`) live in
`@rw3iss/auth-shared/dto` and are re-exported here. The
client_credentials *grant* itself is intentionally **not** in this
browser SDK — minting service tokens requires the secret, which never
belongs in a browser; use the backend SDKs
(`@rw3iss/auth-server-ts`/`-nest`, `rw3iss/auth-server-laravel`).

## User pools + membership admin (system_admin)

Back-office surface for the auth-server's user-pool model (one default
"home" pool per user + N tag pools; see the server's
`docs/USER_POOLS.md`) and for user↔app / user↔org membership:

```ts
// Pool catalog — cached 60s inside the SDK, ideal for type-ahead pickers.
const pools = await auth.pools.list();              // NamespaceInfo[]
const { namespace, namespaces } = await auth.pools.getForUser(userId);
await auth.pools.setUserHome(userId, 'claimleo');    // 409 on email conflict
await auth.pools.addUser(userId, 'wristleo');        // tag (idempotent)
await auth.pools.removeUser(userId, 'wristleo');     // untag (home refused)

// App access (user_apps grants) + org membership.
const apps = await auth.apps.listForUser(userId);      // AppRecord[]
await auth.apps.grantUser(userId, appId);
await auth.apps.revokeUser(userId, appId);
const orgs = await auth.users.getOrganizations(userId);
await auth.organizations.addMember(orgId, userId);            // org_member fallback role
await auth.organizations.removeMember(orgId, userId);  // admin path: adminRemoveMember
```

Preact hooks: `useListNamespaces`, `useGetUserNamespaces`,
`useSetUserHomeNamespace`, `useAddUserNamespace`,
`useRemoveUserNamespace`, `useAdminListUserApps`, `useAdminGrantUserApp`,
`useAdminRevokeUserApp`, `useAdminGetUserOrganizations`,
`useAdminAddOrgMember`, `useAdminRemoveOrgMember`. Pool types
(`NamespaceInfo`, `UserNamespacesResponse`) live in
`@rw3iss/auth-shared/dto`. `UpdateAppRequest` also accepts the
registration-policy fields (`frontend_url`, `allowed_email_domains`,
`allowed_auth_methods`, `default_organization_id`) — PATCH-editable
server-side since 2026-06-10.

## App webhooks (system_admin)

Apps carry outbound webhooks (`AppRecord.webhooks`) dispatched by the
auth-server on `user.registered` — new-user signups through that app:

```ts
await auth.apps.update(appId, {
    webhooks: [{
        name: 'Slack #signups',
        url: 'https://hooks.slack.com/services/T…/B…/x…',
        events: ['user.registered'],
        enabled: true,
    }],
});
```

Delivery is async + best-effort server-side (3 attempts, 5s timeout);
the payload includes the full registration body (password redacted,
extra client fields passed through) — see the auth-server's
`docs/APP_REGISTRATION.md` §Webhooks. `hooks.slack.com` URLs get
Slack `{"text"}` format automatically. Known events:
`APP_WEBHOOK_EVENTS`.

## Type contract

Every wire DTO, JWT claim shape, principal type, and error code this
package emits comes from [`@rw3iss/auth-shared`](https://github.com/rw3iss/auth-shared) —
including the app-registry DTOs (`dto/app.ts`: AppRecord, AppWebhook,
Create/UpdateAppRequest), the org-admin DTOs (`dto/org-admin.ts`:
OrgMemberRecord, OrgRoleRecord, AdminUserOrgMembership, request
shapes), pools (`dto/namespaces.ts`) and m2m (`dto/m2m.ts`) —
the single TypeScript contract every TS auth consumer shares.
`auth-client` re-exports the relevant subset for convenience, so most
callers don't import `auth-shared` directly; pin it explicitly only if
you need its types outside the auth-client surface.

## Architecture

Hexagonal — every external dependency is an injectable port.

```
┌─────────────────────────────────────────────────────────────┐
│              Public API (index.ts + adapters)               │
├─────────────────────────────────────────────────────────────┤
│                       AuthClient                            │
│   facade: composes ports, owns snapshot store +             │
│   event bus + refresh mutex + cross-tab subscriber          │
├─────────────────────────────────────────────────────────────┤
│                          Flows                              │
│   LoginFlow  RefreshFlow  SsoFlow  TotpFlow  …              │
│   one file per server endpoint                              │
├─────────────────────────────────────────────────────────────┤
│                          Ports                              │
│   TokenStore  Transport  Storage  Clock  Crypto             │
│   Logger  Broadcast                                         │
├─────────────────────────────────────────────────────────────┤
│                  Default Adapters (browser)                 │
│   LocalStorage{TokenStore,Storage}  FetchTransport          │
│   WebCryptoAdapter  SystemClock  ConsoleLogger              │
│   BroadcastChannelAdapter (NoOp fallback)                   │
└─────────────────────────────────────────────────────────────┘
```

State machine:

```
            bootstrap='offline'
   ┌─────────────────────────────┐
   │                             ▼
[bootstrapping] ──valid──▶ [authenticated] ──logout──▶ [anonymous]
       │                       │  ▲                       │
       │                       │  └──── login / sso ──────┘
       └──no token────▶ [anonymous]
       │
       └──server reject──▶ [anonymous]
```

`ready()` resolves once the machine reaches a terminal state.

---

## File layout

```
src/
├── index.ts                           Public API (core)
├── core/
│   ├── auth-client.ts                 Facade
│   ├── types.ts                       Public types + port interfaces
│   ├── errors.ts                      AuthError hierarchy + HTTP mapping
│   ├── event-emitter.ts               Typed event bus
│   ├── refresh-mutex.ts               Concurrent-refresh coalescing
│   ├── token-decoder.ts               JWT decode (no verify)
│   ├── pkce.ts                        Verifier + S256 derivation
│   ├── adapters/                      Default port implementations
│   ├── flows/                         One file per server endpoint group
│   └── modules/                       Namespaced module API (client.auth,
│                                      .account, .sessions, .users,
│                                      .organizations, .apps, .services,
│                                      .pools, .audit)
└── framework-adapters/
    ├── shared/                        Per-adapter action plumbing
    ├── react/                         React 18+ adapter
    ├── preact/                        Preact 10+ adapter
    ├── solid/                         SolidJS 1.8+ adapter
    ├── vue/                           Vue 3.4+ plugin + composables
    └── astro/                         Server-side helper for SSR
```

---

## Versioning + breaking changes

Pre-1.0. Public-API surface = exports from `index.ts` and each `framework-adapters/*/index.ts`.

When the SDK reaches 1.0:

- Semver applied to the public API.
- Adding a new port is non-breaking (every port is optional in config).
- Adding a new event type is non-breaking (existing subscribers ignore unknowns).
- Adding a new action / hook is non-breaking.
- Changing an event payload shape is breaking.
- Changing a flow method signature is breaking.
- Wire-format changes track auth-server's API version — bumping the server major implies a bump here.
