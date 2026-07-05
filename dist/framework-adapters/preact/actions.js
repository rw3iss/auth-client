/**
 * Preact action hooks — same shape as the React adapter, using
 * preact/hooks. See ../react/actions.ts for the design rationale.
 */
import { useCallback, useState } from 'preact/hooks';
import { ACTION_BINDINGS, } from '../shared/action-bindings.js';
import { initialActionState, runAction, } from '../shared/action-state.js';
import { useAuthClient } from './context.js';
function useAction(name, explicitClient) {
    const ctxClient = useAuthClient();
    const client = explicitClient ?? ctxClient;
    const [state, setState] = useState(initialActionState);
    const run = useCallback((...args) => {
        const bind = ACTION_BINDINGS[name];
        const op = bind(client);
        return runAction(op, setState, args);
    }, [client, name]);
    const reset = useCallback(() => {
        setState(initialActionState);
    }, []);
    return { ...state, run, reset };
}
export const useLogin = (client) => useAction('login', client);
export const useRegister = (client) => useAction('register', client);
export const useLogout = (client) => useAction('logout', client);
export const useLogoutAll = (client) => useAction('logoutAll', client);
export const useStartSso = (client) => useAction('startSso', client);
export const useCompleteSso = (client) => useAction('completeSso', client);
export const useRefreshTokens = (client) => useAction('refresh', client);
export const useWhoami = (client) => useAction('whoami', client);
export const useSetupTwoFactor = (client) => useAction('setupTwoFactor', client);
export const useEnableTwoFactor = (client) => useAction('enableTwoFactor', client);
export const useDisableTwoFactor = (client) => useAction('disableTwoFactor', client);
export const useImpersonate = (client) => useAction('impersonate', client);
export const useHardDeleteUser = (client) => useAction('hardDeleteUser', client);
export const useRequestPasswordReset = (client) => useAction('requestPasswordReset', client);
export const useResetPassword = (client) => useAction('resetPassword', client);
export const useChangePassword = (client) => useAction('changePassword', client);
export const useVerifyEmail = (client) => useAction('verifyEmail', client);
export const useResendVerificationEmail = (client) => useAction('resendVerificationEmail', client);
export const useGetSessions = (client) => useAction('getSessions', client);
export const useTerminateSession = (client) => useAction('terminateSession', client);
export const useGetMyOrgs = (client) => useAction('getMyOrgs', client);
export const useGetUsersBulk = (client) => useAction('getUsersBulk', client);
export const useSwitchOrg = (client) => useAction('switchOrg', client);
export const useGetOrg = (client) => useAction('getOrg', client);
export const useUpdateOrg = (client) => useAction('updateOrg', client);
export const useCreateOrg = (client) => useAction('createOrg', client);
export const useDeleteOrg = (client) => useAction('deleteOrg', client);
export const useListOrgMembers = (client) => useAction('listOrgMembers', client);
export const useRemoveOrgMember = (client) => useAction('removeOrgMember', client);
export const useUpdateOrgMemberStatus = (client) => useAction('updateOrgMemberStatus', client);
export const useListOrgRoles = (client) => useAction('listOrgRoles', client);
export const useGetOrgRole = (client) => useAction('getOrgRole', client);
export const useCreateOrgRole = (client) => useAction('createOrgRole', client);
export const useUpdateOrgRole = (client) => useAction('updateOrgRole', client);
export const useDeleteOrgRole = (client) => useAction('deleteOrgRole', client);
export const useListAssignablePermissions = (client) => useAction('listAssignablePermissions', client);
export const useCreateInvitation = (client) => useAction('createInvitation', client);
export const useListOrgInvitations = (client) => useAction('listOrgInvitations', client);
export const useRevokeInvitation = (client) => useAction('revokeInvitation', client);
export const useListMyInvitations = (client) => useAction('listMyInvitations', client);
export const useAcceptInvitation = (client) => useAction('acceptInvitation', client);
export const useDeclineInvitation = (client) => useAction('declineInvitation', client);
export const useGetRegistrationPolicy = (client) => useAction('getRegistrationPolicy', client);
export const useListUsers = (client) => useAction('listUsers', client);
/** Admin: list a target user's currently-assigned base roles. Returns `UserRoleRecord[]`. */
export const useListUserRoles = (client) => useAction('listUserRoles', client);
export const useSetUserRoles = (client) => useAction('setUserRoles', client);
export const useSetUserPassword = (client) => useAction('setUserPassword', client);
/** Admin: list every active session for a target user. Returns `SessionRecord[]`. */
export const useAdminListUserSessions = (client) => useAction('adminListUserSessions', client);
/** Admin: terminate one specific session for a target user. */
export const useAdminTerminateUserSession = (client) => useAction('adminTerminateUserSession', client);
/** Admin: terminate every session for a target user (logout-all-for-them). */
export const useAdminRevokeUserSessions = (client) => useAction('adminRevokeUserSessions', client);
/** Admin: clear a target user's failed-login lockout (count + lock). */
export const useAdminResetLockout = (client) => useAction('adminResetLockout', client);
export const useRequestMagicLink = (client) => useAction('requestMagicLink', client);
export const useVerifyMagicLink = (client) => useAction('verifyMagicLink', client);
export const useListAuditLog = (client) => useAction('listAuditLog', client);
export const useDeleteMyAccount = (client) => useAction('deleteMyAccount', client);
/** Admin: list every org. adminChain. Returns `Organization[]`. */
export const useListAllOrgs = (client) => useAction('listAllOrgs', client);
/** Admin: fetch one org via /admin/organizations/{orgId} (non-member operators allowed). */
export const useAdminGetOrg = (client) => useAction('adminGetOrg', client);
/** Admin: update one org via /admin/organizations/{orgId}. */
export const useAdminUpdateOrg = (client) => useAction('adminUpdateOrg', client);
/** Admin: list members via /admin/organizations/{orgId}/members. */
export const useAdminListOrgMembers = (client) => useAction('adminListOrgMembers', client);
/** System_admin: replace a member's org-role set (org-admin reassignment). */
export const useAdminSetOrgMemberRoles = (client) => useAction('adminSetOrgMemberRoles', client);
/* ── Apps administration ──────────────────────────────────────────── */
/** Admin: list every registered app. adminChain. Returns `AppRecord[]`. */
export const useListApps = (client) => useAction('listApps', client);
/** Admin: fetch one app row. adminChain. */
export const useGetApp = (client) => useAction('getApp', client);
/** System_admin: register a new app. */
export const useCreateApp = (client) => useAction('createApp', client);
/** System_admin: partial update. */
export const useUpdateApp = (client) => useAction('updateApp', client);
/** System_admin: soft-delete an app. */
export const useDeleteApp = (client) => useAction('deleteApp', client);
/* ── User pools (namespaces; system_admin only) ───────────────────── */
/** System_admin: pool catalog with user counts (SDK-cached 60s). */
export const useListNamespaces = (client) => useAction('listNamespaces', client);
/** System_admin: a user's home pool + tag pools. */
export const useGetUserNamespaces = (client) => useAction('getUserNamespaces', client);
/** System_admin: move a user's default (home) pool — 409 on email conflict. */
export const useSetUserHomeNamespace = (client) => useAction('setUserHomeNamespace', client);
/** System_admin: tag a user into an additional pool. */
export const useAddUserNamespace = (client) => useAction('addUserNamespace', client);
/** System_admin: remove a pool tag (home pool refused). */
export const useRemoveUserNamespace = (client) => useAction('removeUserNamespace', client);
/* ── Admin user↔app / user↔org membership management ──────────────── */
/** Admin: a user's active app memberships. */
export const useAdminListUserApps = (client) => useAction('adminListUserApps', client);
/** Admin: grant a user access to an app (user_apps row). */
export const useAdminGrantUserApp = (client) => useAction('adminGrantUserApp', client);
/** Admin: revoke a user's app access (identity untouched). */
export const useAdminRevokeUserApp = (client) => useAction('adminRevokeUserApp', client);
/** System_admin: every org a user belongs to, with status + roles. */
export const useAdminGetUserOrganizations = (client) => useAction('adminGetUserOrganizations', client);
/** System_admin: add an existing user to an org (org_member fallback). */
export const useAdminAddOrgMember = (client) => useAction('adminAddOrgMember', client);
/** System_admin: remove a member from any org (admin path, no org context). */
export const useAdminRemoveOrgMember = (client) => useAction('adminRemoveOrgMember', client);
/* ── M2M clients (the "Services" registry) ────────────────────────── */
/** System_admin: list non-revoked machine credentials. */
export const useListM2MClients = (client) => useAction('listM2MClients', client);
/** System_admin: fetch one m2m client (never the secret). */
export const useGetM2MClient = (client) => useAction('getM2MClient', client);
/** System_admin: mint a machine credential — the response's
 *  `client_secret` is visible exactly ONCE. */
export const useCreateM2MClient = (client) => useAction('createM2MClient', client);
/** System_admin: soft-revoke a machine credential. */
export const useRevokeM2MClient = (client) => useAction('revokeM2MClient', client);
//# sourceMappingURL=actions.js.map