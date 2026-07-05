/**
 * ModuleContext — the shared contract between the AuthClient core and
 * the namespaced API modules (src/core/modules/*).
 *
 * Architecture:
 *
 *   ┌────────────────────────────────────────────────────────────┐
 *   │ AuthClient (core)                                          │
 *   │  config · ports · reactive snapshot · token store ·        │
 *   │  refresh scheduling · cross-tab sync · session engine      │
 *   │  (login/logout/refresh/SSO-complete/… mutate state HERE)   │
 *   └──────────────┬─────────────────────────────────────────────┘
 *                  │ builds one ModuleContext, hands it to every module
 *   ┌──────────────▼─────────────────────────────────────────────┐
 *   │ Modules (client.auth / .account / .sessions / .users /     │
 *   │ .organizations / .apps / .services / .pools / .audit)      │
 *   │  OWN the endpoint implementations: ctx.guard() +           │
 *   │  ctx.flows.<flow>.<call>(). Session-mutating operations    │
 *   │  delegate to ctx.core — the session engine stays single-   │
 *   │  owner (SRP) while modules stay stateless and isolated.    │
 *   └────────────────────────────────────────────────────────────┘
 *
 * Modules never touch client state directly and never construct
 * flows — everything arrives through this context, which keeps them
 * trivially testable (pass a stub context) and keeps the dependency
 * direction one-way: modules → context ← core.
 */
export {};
//# sourceMappingURL=module-context.js.map