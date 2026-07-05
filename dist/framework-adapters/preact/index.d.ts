/**
 * Preact adapter — public API.
 *
 * Import as: `import { AuthProvider, useAuth } from '@rw3iss/auth-client/preact'`.
 *
 * API is identical to the React adapter; the two are interchangeable
 * from the consumer's perspective. Pick the one that matches your
 * runtime — React for React projects, Preact for Preact projects.
 *
 * If your project uses preact/compat to alias react → preact, the React
 * adapter ALSO works (preact/compat provides useSyncExternalStore).
 * The dedicated Preact adapter avoids that alias-dance and keeps
 * preact/* as native imports.
 */
export { AuthProvider, useAuthClient } from './context.js';
export type { AuthProviderProps } from './context.js';
export { useAuth, useUser, useAuthStatus, useIsAuthenticated, useAuthReady, useOrg, useAppPolicy, useSsoProviders, } from './hooks.js';
export { useLogin, useRegister, useLogout, useLogoutAll, useStartSso, useCompleteSso, useRefreshTokens, useWhoami, useSetupTwoFactor, useEnableTwoFactor, useDisableTwoFactor, useImpersonate, useHardDeleteUser, useRequestPasswordReset, useResetPassword, useChangePassword, useVerifyEmail, useResendVerificationEmail, useGetSessions, useTerminateSession, useGetMyOrgs, useGetUsersBulk, useSwitchOrg, useGetOrg, useUpdateOrg, useCreateOrg, useDeleteOrg, useListOrgMembers, useRemoveOrgMember, useUpdateOrgMemberStatus, useListOrgRoles, useGetOrgRole, useCreateOrgRole, useUpdateOrgRole, useDeleteOrgRole, useListAssignablePermissions, useCreateInvitation, useListOrgInvitations, useRevokeInvitation, useListMyInvitations, useAcceptInvitation, useDeclineInvitation, useGetRegistrationPolicy, useListUsers, useListUserRoles, useSetUserRoles, useSetUserPassword, useAdminListUserSessions, useAdminTerminateUserSession, useAdminRevokeUserSessions, useRequestMagicLink, useVerifyMagicLink, useListAuditLog, useDeleteMyAccount, useListAllOrgs, useAdminGetOrg, useAdminUpdateOrg, useAdminListOrgMembers, useAdminSetOrgMemberRoles, useListApps, useGetApp, useCreateApp, useUpdateApp, useDeleteApp, useListNamespaces, useGetUserNamespaces, useSetUserHomeNamespace, useAddUserNamespace, useRemoveUserNamespace, useAdminListUserApps, useAdminGrantUserApp, useAdminRevokeUserApp, useAdminGetUserOrganizations, useAdminAddOrgMember, useAdminRemoveOrgMember, useListM2MClients, useGetM2MClient, useCreateM2MClient, useRevokeM2MClient, } from './actions.js';
export type { Action, ActionState } from '../shared/action-state.js';
//# sourceMappingURL=index.d.ts.map