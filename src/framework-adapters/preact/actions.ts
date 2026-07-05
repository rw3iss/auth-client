/**
 * Preact action hooks — same shape as the React adapter, using
 * preact/hooks. See ../react/actions.ts for the design rationale.
 */

import { useCallback, useState } from 'preact/hooks';
import {
    ACTION_BINDINGS,
    type ActionName,
} from '../shared/action-bindings.js';
import {
    type ActionState,
    type Action,
    initialActionState,
    runAction,
} from '../shared/action-state.js';
import { useAuthClient } from './context.js';
import type { AuthClient } from '../../core/auth-client.js';

function useAction<Name extends ActionName>(
    name: Name,
    explicitClient: AuthClient | undefined,
): Action<
    Parameters<ReturnType<(typeof ACTION_BINDINGS)[Name]>>,
    Awaited<ReturnType<ReturnType<(typeof ACTION_BINDINGS)[Name]>>>
> {
    type Op = ReturnType<(typeof ACTION_BINDINGS)[Name]>;
    type Result = Awaited<ReturnType<Op>>;
    type Args = Parameters<Op>;

    const ctxClient = useAuthClient();
    const client = explicitClient ?? ctxClient;
    const [state, setState] = useState<ActionState<Result>>(
        initialActionState as ActionState<Result>,
    );

    const run = useCallback(
        (...args: Args): Promise<Result> => {
            const bind = ACTION_BINDINGS[name] as (
                c: AuthClient,
            ) => (...a: Args) => Promise<Result>;
            const op = bind(client);
            return runAction(op, setState, args);
        },
        [client, name],
    );

    const reset = useCallback(() => {
        setState(initialActionState as ActionState<Result>);
    }, []);

    return { ...state, run, reset };
}

export const useLogin = (client?: AuthClient) => useAction('login', client);
export const useRegister = (client?: AuthClient) => useAction('register', client);
export const useLogout = (client?: AuthClient) => useAction('logout', client);
export const useLogoutAll = (client?: AuthClient) => useAction('logoutAll', client);
export const useStartSso = (client?: AuthClient) => useAction('startSso', client);
export const useCompleteSso = (client?: AuthClient) => useAction('completeSso', client);
export const useRefreshTokens = (client?: AuthClient) => useAction('refresh', client);
export const useWhoami = (client?: AuthClient) => useAction('whoami', client);
export const useSetupTwoFactor = (client?: AuthClient) => useAction('setupTwoFactor', client);
export const useEnableTwoFactor = (client?: AuthClient) => useAction('enableTwoFactor', client);
export const useDisableTwoFactor = (client?: AuthClient) => useAction('disableTwoFactor', client);
export const useImpersonate = (client?: AuthClient) => useAction('impersonate', client);
export const useHardDeleteUser = (client?: AuthClient) => useAction('hardDeleteUser', client);
export const useRequestPasswordReset = (client?: AuthClient) => useAction('requestPasswordReset', client);
export const useResetPassword = (client?: AuthClient) => useAction('resetPassword', client);
export const useChangePassword = (client?: AuthClient) => useAction('changePassword', client);
export const useVerifyEmail = (client?: AuthClient) => useAction('verifyEmail', client);
export const useResendVerificationEmail = (client?: AuthClient) => useAction('resendVerificationEmail', client);
export const useGetSessions = (client?: AuthClient) => useAction('getSessions', client);
export const useTerminateSession = (client?: AuthClient) => useAction('terminateSession', client);
export const useGetMyOrgs = (client?: AuthClient) => useAction('getMyOrgs', client);
export const useGetUsersBulk = (client?: AuthClient) => useAction('getUsersBulk', client);
export const useSwitchOrg = (client?: AuthClient) => useAction('switchOrg', client);
export const useGetOrg = (client?: AuthClient) => useAction('getOrg', client);
export const useUpdateOrg = (client?: AuthClient) => useAction('updateOrg', client);
export const useCreateOrg = (client?: AuthClient) => useAction('createOrg', client);
export const useDeleteOrg = (client?: AuthClient) => useAction('deleteOrg', client);
export const useListOrgMembers = (client?: AuthClient) => useAction('listOrgMembers', client);
export const useRemoveOrgMember = (client?: AuthClient) => useAction('removeOrgMember', client);
export const useUpdateOrgMemberStatus = (client?: AuthClient) => useAction('updateOrgMemberStatus', client);
export const useListOrgRoles = (client?: AuthClient) => useAction('listOrgRoles', client);
export const useGetOrgRole = (client?: AuthClient) => useAction('getOrgRole', client);
export const useCreateOrgRole = (client?: AuthClient) => useAction('createOrgRole', client);
export const useUpdateOrgRole = (client?: AuthClient) => useAction('updateOrgRole', client);
export const useDeleteOrgRole = (client?: AuthClient) => useAction('deleteOrgRole', client);
export const useListAssignablePermissions = (client?: AuthClient) => useAction('listAssignablePermissions', client);
export const useCreateInvitation = (client?: AuthClient) => useAction('createInvitation', client);
export const useListOrgInvitations = (client?: AuthClient) => useAction('listOrgInvitations', client);
export const useRevokeInvitation = (client?: AuthClient) => useAction('revokeInvitation', client);
export const useListMyInvitations = (client?: AuthClient) => useAction('listMyInvitations', client);
export const useAcceptInvitation = (client?: AuthClient) => useAction('acceptInvitation', client);
export const useDeclineInvitation = (client?: AuthClient) => useAction('declineInvitation', client);
export const useGetRegistrationPolicy = (client?: AuthClient) => useAction('getRegistrationPolicy', client);
export const useListUsers = (client?: AuthClient) => useAction('listUsers', client);
/** Admin: list a target user's currently-assigned base roles. Returns `UserRoleRecord[]`. */
export const useListUserRoles = (client?: AuthClient) => useAction('listUserRoles', client);
export const useSetUserRoles = (client?: AuthClient) => useAction('setUserRoles', client);
export const useSetUserPassword = (client?: AuthClient) => useAction('setUserPassword', client);
/** Admin: list every active session for a target user. Returns `SessionRecord[]`. */
export const useAdminListUserSessions = (client?: AuthClient) => useAction('adminListUserSessions', client);
/** Admin: terminate one specific session for a target user. */
export const useAdminTerminateUserSession = (client?: AuthClient) => useAction('adminTerminateUserSession', client);
/** Admin: terminate every session for a target user (logout-all-for-them). */
export const useAdminRevokeUserSessions = (client?: AuthClient) => useAction('adminRevokeUserSessions', client);
/** Admin: clear a target user's failed-login lockout (count + lock). */
export const useAdminResetLockout = (client?: AuthClient) => useAction('adminResetLockout', client);
export const useRequestMagicLink = (client?: AuthClient) => useAction('requestMagicLink', client);
export const useVerifyMagicLink = (client?: AuthClient) => useAction('verifyMagicLink', client);
export const useListAuditLog = (client?: AuthClient) => useAction('listAuditLog', client);
export const useDeleteMyAccount = (client?: AuthClient) => useAction('deleteMyAccount', client);

/** Admin: list every org. adminChain. Returns `Organization[]`. */
export const useListAllOrgs = (client?: AuthClient) => useAction('listAllOrgs', client);
/** Admin: fetch one org via /admin/organizations/{orgId} (non-member operators allowed). */
export const useAdminGetOrg = (client?: AuthClient) => useAction('adminGetOrg', client);
/** Admin: update one org via /admin/organizations/{orgId}. */
export const useAdminUpdateOrg = (client?: AuthClient) => useAction('adminUpdateOrg', client);
/** Admin: list members via /admin/organizations/{orgId}/members. */
export const useAdminListOrgMembers = (client?: AuthClient) => useAction('adminListOrgMembers', client);
/** System_admin: replace a member's org-role set (org-admin reassignment). */
export const useAdminSetOrgMemberRoles = (client?: AuthClient) => useAction('adminSetOrgMemberRoles', client);

/* ── Apps administration ──────────────────────────────────────────── */
/** Admin: list every registered app. adminChain. Returns `AppRecord[]`. */
export const useListApps = (client?: AuthClient) => useAction('listApps', client);
/** Admin: fetch one app row. adminChain. */
export const useGetApp = (client?: AuthClient) => useAction('getApp', client);
/** System_admin: register a new app. */
export const useCreateApp = (client?: AuthClient) => useAction('createApp', client);
/** System_admin: partial update. */
export const useUpdateApp = (client?: AuthClient) => useAction('updateApp', client);
/** System_admin: soft-delete an app. */
export const useDeleteApp = (client?: AuthClient) => useAction('deleteApp', client);

/* ── User pools (namespaces; system_admin only) ───────────────────── */
/** System_admin: pool catalog with user counts (SDK-cached 60s). */
export const useListNamespaces = (client?: AuthClient) => useAction('listNamespaces', client);
/** System_admin: a user's home pool + tag pools. */
export const useGetUserNamespaces = (client?: AuthClient) => useAction('getUserNamespaces', client);
/** System_admin: move a user's default (home) pool — 409 on email conflict. */
export const useSetUserHomeNamespace = (client?: AuthClient) => useAction('setUserHomeNamespace', client);
/** System_admin: tag a user into an additional pool. */
export const useAddUserNamespace = (client?: AuthClient) => useAction('addUserNamespace', client);
/** System_admin: remove a pool tag (home pool refused). */
export const useRemoveUserNamespace = (client?: AuthClient) => useAction('removeUserNamespace', client);

/* ── Admin user↔app / user↔org membership management ──────────────── */
/** Admin: a user's active app memberships. */
export const useAdminListUserApps = (client?: AuthClient) => useAction('adminListUserApps', client);
/** Admin: grant a user access to an app (user_apps row). */
export const useAdminGrantUserApp = (client?: AuthClient) => useAction('adminGrantUserApp', client);
/** Admin: revoke a user's app access (identity untouched). */
export const useAdminRevokeUserApp = (client?: AuthClient) => useAction('adminRevokeUserApp', client);
/** System_admin: every org a user belongs to, with status + roles. */
export const useAdminGetUserOrganizations = (client?: AuthClient) => useAction('adminGetUserOrganizations', client);
/** System_admin: add an existing user to an org (org_member fallback). */
export const useAdminAddOrgMember = (client?: AuthClient) => useAction('adminAddOrgMember', client);
/** System_admin: remove a member from any org (admin path, no org context). */
export const useAdminRemoveOrgMember = (client?: AuthClient) => useAction('adminRemoveOrgMember', client);

/* ── M2M clients (the "Services" registry) ────────────────────────── */
/** System_admin: list non-revoked machine credentials. */
export const useListM2MClients = (client?: AuthClient) => useAction('listM2MClients', client);
/** System_admin: fetch one m2m client (never the secret). */
export const useGetM2MClient = (client?: AuthClient) => useAction('getM2MClient', client);
/** System_admin: mint a machine credential — the response's
 *  `client_secret` is visible exactly ONCE. */
export const useCreateM2MClient = (client?: AuthClient) => useAction('createM2MClient', client);
/** System_admin: soft-revoke a machine credential. */
export const useRevokeM2MClient = (client?: AuthClient) => useAction('revokeM2MClient', client);
