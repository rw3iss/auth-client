/**
 * Atomic Preact components — single-purpose primitives that wrap one
 * AuthClient capability each. Tree-shake-friendly: import only what
 * you need; the rest is dropped by the bundler.
 *
 * Import path: `@rw3iss/auth-client/preact/ui`
 *
 * Grouping convention:
 *   - Status displays: AuthStatusBadge, UserAvatar, TokenExpiryCountdown
 *   - Action triggers: LogoutButton, LogoutAllButton, SsoButton(s)
 *   - Composed atoms: UserMenu, SsoButtonGroup
 *   - Gates: ProtectedRoute, GuestOnly, RoleGate, PermissionGate, AuthLoading
 */
export { AuthStatusBadge } from './AuthStatusBadge.js';
export { UserAvatar } from './UserAvatar.js';
export { UserMenu } from './UserMenu.js';
export { LogoutButton } from './LogoutButton.js';
export { LogoutAllButton } from './LogoutAllButton.js';
export { SsoButton, SignInWithGoogleButton, SignInWithAppleButton, SignInWithMicrosoftButton, SignInWithGitHubButton, SignInWithXButton, } from './SsoButton.js';
export { SsoButtonGroup } from './SsoButtonGroup.js';
export { ProtectedRoute } from './ProtectedRoute.js';
export { GuestOnly } from './GuestOnly.js';
export { RoleGate } from './RoleGate.js';
export { PermissionGate } from './PermissionGate.js';
export { AuthLoading } from './AuthLoading.js';
export { TokenExpiryCountdown } from './TokenExpiryCountdown.js';
export { PasswordStrengthMeter, defaultPasswordScore } from './PasswordStrengthMeter.js';
//# sourceMappingURL=index.js.map