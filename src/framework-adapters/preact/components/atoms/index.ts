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
export type { AuthStatusBadgeProps } from './AuthStatusBadge.js';

export { UserAvatar } from './UserAvatar.js';
export type { UserAvatarProps } from './UserAvatar.js';

export { UserMenu } from './UserMenu.js';
export type { UserMenuProps } from './UserMenu.js';

export { LogoutButton } from './LogoutButton.js';
export type { LogoutButtonProps } from './LogoutButton.js';

export { LogoutAllButton } from './LogoutAllButton.js';
export type { LogoutAllButtonProps } from './LogoutAllButton.js';

export {
    SsoButton,
    SignInWithGoogleButton,
    SignInWithAppleButton,
    SignInWithMicrosoftButton,
    SignInWithGitHubButton,
    SignInWithXButton,
} from './SsoButton.js';
export type { SsoButtonProps } from './SsoButton.js';

export { SsoButtonGroup } from './SsoButtonGroup.js';
export type { SsoButtonGroupProps, SsoProviderName } from './SsoButtonGroup.js';

export { ProtectedRoute } from './ProtectedRoute.js';
export type { ProtectedRouteProps } from './ProtectedRoute.js';

export { GuestOnly } from './GuestOnly.js';
export type { GuestOnlyProps } from './GuestOnly.js';

export { RoleGate } from './RoleGate.js';
export type { RoleGateProps } from './RoleGate.js';

export { PermissionGate } from './PermissionGate.js';
export type { PermissionGateProps } from './PermissionGate.js';

export { AuthLoading } from './AuthLoading.js';
export type { AuthLoadingProps } from './AuthLoading.js';

export { TokenExpiryCountdown } from './TokenExpiryCountdown.js';
export type { TokenExpiryCountdownProps } from './TokenExpiryCountdown.js';

export { PasswordStrengthMeter, defaultPasswordScore } from './PasswordStrengthMeter.js';
export type { PasswordStrengthMeterProps, PasswordScore } from './PasswordStrengthMeter.js';
