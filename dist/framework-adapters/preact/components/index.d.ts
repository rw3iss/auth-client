/**
 * `@rw3iss/auth-client/preact/ui` — top-level barrel for every UI
 * component. Tree-shakeable: import only the names you use; bundlers
 * (Vite, Rollup, esbuild, Webpack) drop the rest thanks to ESM +
 * `sideEffects: false` in package.json.
 *
 * Three tiers:
 *
 *   1. atoms     — single-purpose primitives (gates, badges, SSO
 *                  buttons). Compose these when you need full layout
 *                  control.
 *
 *   2. forms     — multi-field, single-purpose views (LoginForm,
 *                  ChangePasswordForm). Wire onSuccess/onError to
 *                  navigate or toast.
 *
 *   3. flows     — full-screen, multi-step compositions
 *                  (CompleteLoginFlow, CompleteAccountSecurityFlow).
 *                  Drop straight into a route.
 *
 * Each tier also has its own subpath barrel — `./atoms`, `./forms`,
 * `./flows` — for callers who prefer category-scoped imports.
 */
export * from './atoms/index.js';
export * from './forms/index.js';
export * from './flows/index.js';
//# sourceMappingURL=index.d.ts.map