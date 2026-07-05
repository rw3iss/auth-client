/**
 * Astro adapter — public API.
 *
 * Server-side helpers for `.astro` front-matter scripts and API routes.
 *
 * For client islands (interactive components inside an .astro page),
 * pair this with one of the matching framework adapters:
 *
 *   - React island: import from '@vendidit/auth-client/react'
 *   - Preact island: import from '@vendidit/auth-client/preact'
 *   - Solid island: import from '@vendidit/auth-client/solid'
 *   - Vue island: import from '@vendidit/auth-client/vue'
 *
 * The pattern: server-side gate via getServerAuth (redirect anonymous
 * users, fetch user data for the initial render); client-side mount an
 * <AuthProvider> from your island framework for interactivity.
 */
export { getServerAuth } from './server.js';
export type { ServerAuthConfig, ServerAuthResult } from './server.js';
//# sourceMappingURL=index.d.ts.map