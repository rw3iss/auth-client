/**
 * Preact action hooks — same shape as the React adapter, using
 * preact/hooks. See ../react/actions.ts for the design rationale.
 */
import { type Action } from '../shared/action-state.js';
import type { AuthClient } from '../../core/auth-client.js';
export declare const useLogin: (client?: AuthClient) => Action<[params: import("../../index.js").LoginParams], import("@rw3iss/auth-shared").AuthResponse>;
export declare const useRegister: (client?: AuthClient) => Action<[params: import("../../index.js").RegisterParams], import("@rw3iss/auth-shared").AuthResponse>;
export declare const useLogout: (client?: AuthClient) => Action<[], void>;
export declare const useLogoutAll: (client?: AuthClient) => Action<[], void>;
export declare const useStartSso: (client?: AuthClient) => Action<[params: import("../../index.js").SsoStartParams], import("../../index.js").SsoStartResult>;
export declare const useCompleteSso: (client?: AuthClient) => Action<[params: {
    code: string;
    state: string;
    provider?: string;
}], import("@rw3iss/auth-shared").AuthResponse>;
export declare const useRefreshTokens: (client?: AuthClient) => Action<[], import("@rw3iss/auth-shared").TokenPair>;
export declare const useWhoami: (client?: AuthClient) => Action<[], import("@rw3iss/auth-shared").User>;
export declare const useSetupTwoFactor: (client?: AuthClient) => Action<[], {
    secret: string;
    provisioningUri: string;
}>;
export declare const useEnableTwoFactor: (client?: AuthClient) => Action<[code: string], void>;
export declare const useDisableTwoFactor: (client?: AuthClient) => Action<[params: {
    password: string;
    code: string;
}], void>;
export declare const useImpersonate: (client?: AuthClient) => Action<[params: import("../../index.js").ImpersonateParams], import("@rw3iss/auth-shared").AuthResponse>;
export declare const useHardDeleteUser: (client?: AuthClient) => Action<[params: {
    userId: string;
    reason: string;
}], void>;
export declare const useRequestPasswordReset: (client?: AuthClient) => Action<[params: {
    email: string;
    appCode?: string;
}], void>;
export declare const useResetPassword: (client?: AuthClient) => Action<[params: {
    token: string;
    newPassword: string;
}], void>;
export declare const useChangePassword: (client?: AuthClient) => Action<[params: {
    currentPassword: string;
    newPassword: string;
}], void>;
export declare const useVerifyEmail: (client?: AuthClient) => Action<[token: string], void>;
export declare const useResendVerificationEmail: (client?: AuthClient) => Action<[params: {
    email: string;
    appCode?: string;
}], void>;
export declare const useGetSessions: (client?: AuthClient) => Action<[], import("@rw3iss/auth-shared").SessionRecord[]>;
export declare const useTerminateSession: (client?: AuthClient) => Action<[sessionId: string], void>;
export declare const useGetMyOrgs: (client?: AuthClient) => Action<[], import("@rw3iss/auth-shared").MyOrgRecord[]>;
export declare const useGetUsersBulk: (client?: AuthClient) => Action<[req: {
    emails?: string[];
    ids?: string[];
}], import("@rw3iss/auth-shared").LookupUserRecord[]>;
export declare const useSwitchOrg: (client?: AuthClient) => Action<[organizationId: string], import("@rw3iss/auth-shared").TokenPair>;
export declare const useGetOrg: (client?: AuthClient) => Action<[orgId: string], import("@rw3iss/auth-shared").Organization>;
export declare const useUpdateOrg: (client?: AuthClient) => Action<[params: {
    orgId: string;
    body: import("@rw3iss/auth-shared").UpdateOrgRequest;
}], import("@rw3iss/auth-shared").Organization>;
export declare const useCreateOrg: (client?: AuthClient) => Action<[body: import("@rw3iss/auth-shared").CreateOrgRequest], import("@rw3iss/auth-shared").Organization>;
export declare const useDeleteOrg: (client?: AuthClient) => Action<[orgId: string], void>;
export declare const useListOrgMembers: (client?: AuthClient) => Action<[orgId: string], import("@rw3iss/auth-shared").OrgMemberRecord[]>;
export declare const useRemoveOrgMember: (client?: AuthClient) => Action<[params: {
    orgId: string;
    userId: string;
}], void>;
export declare const useUpdateOrgMemberStatus: (client?: AuthClient) => Action<[params: {
    orgId: string;
    userId: string;
    status: string;
}], void>;
export declare const useListOrgRoles: (client?: AuthClient) => Action<[orgId: string], import("@rw3iss/auth-shared").OrgRoleRecord[]>;
export declare const useGetOrgRole: (client?: AuthClient) => Action<[params: {
    orgId: string;
    roleId: string;
}], import("@rw3iss/auth-shared").OrgRoleRecord>;
export declare const useCreateOrgRole: (client?: AuthClient) => Action<[params: {
    orgId: string;
    body: import("@rw3iss/auth-shared").CreateOrgRoleRequest;
}], import("@rw3iss/auth-shared").OrgRoleRecord>;
export declare const useUpdateOrgRole: (client?: AuthClient) => Action<[params: {
    orgId: string;
    roleId: string;
    body: import("@rw3iss/auth-shared").UpdateOrgRoleRequest;
}], import("@rw3iss/auth-shared").OrgRoleRecord>;
export declare const useDeleteOrgRole: (client?: AuthClient) => Action<[params: {
    orgId: string;
    roleId: string;
}], void>;
export declare const useListAssignablePermissions: (client?: AuthClient) => Action<[orgId: string], import("@rw3iss/auth-shared").AssignablePermissionRecord[]>;
export declare const useCreateInvitation: (client?: AuthClient) => Action<[params: {
    orgId: string;
    body: import("@rw3iss/auth-shared").CreateInvitationRequest;
}], import("@rw3iss/auth-shared").InvitationRecord>;
export declare const useListOrgInvitations: (client?: AuthClient) => Action<[orgId: string], import("@rw3iss/auth-shared").InvitationRecord[]>;
export declare const useRevokeInvitation: (client?: AuthClient) => Action<[params: {
    orgId: string;
    invitationId: string;
}], void>;
export declare const useListMyInvitations: (client?: AuthClient) => Action<[], import("@rw3iss/auth-shared").InvitationRecord[]>;
export declare const useAcceptInvitation: (client?: AuthClient) => Action<[invitationId: string], import("@rw3iss/auth-shared").Organization | null>;
export declare const useDeclineInvitation: (client?: AuthClient) => Action<[invitationId: string], void>;
export declare const useGetRegistrationPolicy: (client?: AuthClient) => Action<[appCode?: string | undefined], import("@rw3iss/auth-shared").RegistrationPolicy>;
export declare const useListUsers: (client?: AuthClient) => Action<[req?: import("../../core/flows/admin.flow.js").ListUsersRequest | undefined], import("../../core/flows/admin.flow.js").ListUsersResult>;
/** Admin: list a target user's currently-assigned base roles. Returns `UserRoleRecord[]`. */
export declare const useListUserRoles: (client?: AuthClient) => Action<[userId: string], import("../../core/flows/admin.flow.js").UserRoleRecord[]>;
export declare const useSetUserRoles: (client?: AuthClient) => Action<[params: {
    userId: string;
    roleCodes: string[];
}], void>;
export declare const useSetUserPassword: (client?: AuthClient) => Action<[params: {
    userId: string;
    newPassword: string;
}], void>;
/** Admin: list every active session for a target user. Returns `SessionRecord[]`. */
export declare const useAdminListUserSessions: (client?: AuthClient) => Action<[userId: string], import("@rw3iss/auth-shared").SessionRecord[]>;
/** Admin: terminate one specific session for a target user. */
export declare const useAdminTerminateUserSession: (client?: AuthClient) => Action<[params: {
    userId: string;
    sessionId: string;
}], void>;
/** Admin: terminate every session for a target user (logout-all-for-them). */
export declare const useAdminRevokeUserSessions: (client?: AuthClient) => Action<[userId: string], void>;
/** Admin: clear a target user's failed-login lockout (count + lock). */
export declare const useAdminResetLockout: (client?: AuthClient) => Action<[userId: string], void>;
export declare const useRequestMagicLink: (client?: AuthClient) => Action<[params: {
    email: string;
    appCode?: string;
}], void>;
export declare const useVerifyMagicLink: (client?: AuthClient) => Action<[token: string], import("@rw3iss/auth-shared").AuthResponse>;
export declare const useListAuditLog: (client?: AuthClient) => Action<[q?: import("@rw3iss/auth-shared").AuditLogQuery | undefined], import("@rw3iss/auth-shared").AuditLogResult>;
export declare const useDeleteMyAccount: (client?: AuthClient) => Action<[currentPassword: string], void>;
/** Admin: list every org. adminChain. Returns `Organization[]`. */
export declare const useListAllOrgs: (client?: AuthClient) => Action<[], import("@rw3iss/auth-shared").Organization[]>;
/** Admin: fetch one org via /admin/organizations/{orgId} (non-member operators allowed). */
export declare const useAdminGetOrg: (client?: AuthClient) => Action<[orgId: string], import("@rw3iss/auth-shared").Organization>;
/** Admin: update one org via /admin/organizations/{orgId}. */
export declare const useAdminUpdateOrg: (client?: AuthClient) => Action<[params: {
    orgId: string;
    body: import("@rw3iss/auth-shared").UpdateOrgRequest;
}], import("@rw3iss/auth-shared").Organization>;
/** Admin: list members via /admin/organizations/{orgId}/members. */
export declare const useAdminListOrgMembers: (client?: AuthClient) => Action<[orgId: string], import("@rw3iss/auth-shared").OrgMemberRecord[]>;
/** System_admin: replace a member's org-role set (org-admin reassignment). */
export declare const useAdminSetOrgMemberRoles: (client?: AuthClient) => Action<[params: {
    orgId: string;
    userId: string;
    roleCodes: string[];
}], import("@rw3iss/auth-shared").OrgMemberRecord>;
/** Admin: list every registered app. adminChain. Returns `AppRecord[]`. */
export declare const useListApps: (client?: AuthClient) => Action<[], import("@rw3iss/auth-shared").AppRecord[]>;
/** Admin: fetch one app row. adminChain. */
export declare const useGetApp: (client?: AuthClient) => Action<[appId: string], import("@rw3iss/auth-shared").AppRecord>;
/** System_admin: register a new app. */
export declare const useCreateApp: (client?: AuthClient) => Action<[body: import("@rw3iss/auth-shared").CreateAppRequest], import("@rw3iss/auth-shared").AppRecord>;
/** System_admin: partial update. */
export declare const useUpdateApp: (client?: AuthClient) => Action<[params: {
    appId: string;
    body: import("@rw3iss/auth-shared").UpdateAppRequest;
}], import("@rw3iss/auth-shared").AppRecord>;
/** System_admin: soft-delete an app. */
export declare const useDeleteApp: (client?: AuthClient) => Action<[appId: string], void>;
/** System_admin: pool catalog with user counts (SDK-cached 60s). */
export declare const useListNamespaces: (client?: AuthClient) => Action<[opts?: {
    forceRefresh?: boolean;
} | undefined], import("@rw3iss/auth-shared").NamespaceInfo[]>;
/** System_admin: a user's home pool + tag pools. */
export declare const useGetUserNamespaces: (client?: AuthClient) => Action<[userId: string], import("@rw3iss/auth-shared").UserNamespacesResponse>;
/** System_admin: move a user's default (home) pool — 409 on email conflict. */
export declare const useSetUserHomeNamespace: (client?: AuthClient) => Action<[params: {
    userId: string;
    namespace: string;
}], void>;
/** System_admin: tag a user into an additional pool. */
export declare const useAddUserNamespace: (client?: AuthClient) => Action<[params: {
    userId: string;
    namespace: string;
}], void>;
/** System_admin: remove a pool tag (home pool refused). */
export declare const useRemoveUserNamespace: (client?: AuthClient) => Action<[params: {
    userId: string;
    namespace: string;
}], void>;
/** Admin: a user's active app memberships. */
export declare const useAdminListUserApps: (client?: AuthClient) => Action<[userId: string], import("@rw3iss/auth-shared").AppRecord[]>;
/** Admin: grant a user access to an app (user_apps row). */
export declare const useAdminGrantUserApp: (client?: AuthClient) => Action<[params: {
    userId: string;
    appId: string;
}], void>;
/** Admin: revoke a user's app access (identity untouched). */
export declare const useAdminRevokeUserApp: (client?: AuthClient) => Action<[params: {
    userId: string;
    appId: string;
}], void>;
/** System_admin: every org a user belongs to, with status + roles. */
export declare const useAdminGetUserOrganizations: (client?: AuthClient) => Action<[userId: string], import("@rw3iss/auth-shared").AdminUserOrgMembership[]>;
/** System_admin: add an existing user to an org (org_member fallback). */
export declare const useAdminAddOrgMember: (client?: AuthClient) => Action<[params: {
    orgId: string;
    userId: string;
    roleIds?: string[];
}], void>;
/** System_admin: remove a member from any org (admin path, no org context). */
export declare const useAdminRemoveOrgMember: (client?: AuthClient) => Action<[params: {
    orgId: string;
    userId: string;
}], void>;
/** System_admin: list non-revoked machine credentials. */
export declare const useListM2MClients: (client?: AuthClient) => Action<[], import("@rw3iss/auth-shared").M2MClientRecord[]>;
/** System_admin: fetch one m2m client (never the secret). */
export declare const useGetM2MClient: (client?: AuthClient) => Action<[id: string], import("@rw3iss/auth-shared").M2MClientRecord>;
/** System_admin: mint a machine credential — the response's
 *  `client_secret` is visible exactly ONCE. */
export declare const useCreateM2MClient: (client?: AuthClient) => Action<[body: import("@rw3iss/auth-shared").CreateM2MClientRequest], import("@rw3iss/auth-shared").CreateM2MClientResponse>;
/** System_admin: soft-revoke a machine credential. */
export declare const useRevokeM2MClient: (client?: AuthClient) => Action<[id: string], void>;
//# sourceMappingURL=actions.d.ts.map