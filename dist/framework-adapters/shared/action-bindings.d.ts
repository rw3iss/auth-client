/**
 * Method-binding table — maps each "action name" the framework adapters
 * expose (useLogin, useRegister, ...) to the underlying AuthClient
 * method. Centralizing the mapping here means a new flow added to the
 * core AuthClient surfaces in every adapter by adding ONE row to this
 * table rather than touching five adapter files.
 *
 * Each binding is `(client) => method` so adapters can call the
 * method with the right `this` context without leaking the AuthClient
 * instance into the action signature.
 *
 * Why not just `client.loginWithPassword.bind(client)`? Because the
 * "hook" form benefits from naming: `useLogin` is more idiomatic than
 * `useLoginWithPassword` (login is the user-facing operation; the
 * "with password" qualifier is internal).
 */
import type { AuthClient, ImpersonateParams, LoginParams, RegisterParams, SsoStartParams } from '../../core/auth-client.js';
import type { AuthResponse, TokenPair, User } from '../../core/types.js';
/** Map of public action name → (client) => bound flow method. */
export declare const ACTION_BINDINGS: {
    /** Password login. Accepts the same params as AuthClient.loginWithPassword. */
    readonly login: (client: AuthClient) => (params: LoginParams) => Promise<AuthResponse>;
    /** Register a new user. */
    readonly register: (client: AuthClient) => (params: RegisterParams) => Promise<AuthResponse>;
    /** Logout current session. */
    readonly logout: (client: AuthClient) => () => Promise<void>;
    /** Logout all sessions for the current user. */
    readonly logoutAll: (client: AuthClient) => () => Promise<void>;
    /** Begin SSO. */
    readonly startSso: (client: AuthClient) => (params: SsoStartParams) => Promise<import("../../index.js").SsoStartResult>;
    /** Complete SSO. */
    readonly completeSso: (client: AuthClient) => (params: {
        code: string;
        state: string;
        provider?: string;
    }) => Promise<AuthResponse>;
    /** Refresh tokens manually. */
    readonly refresh: (client: AuthClient) => () => Promise<TokenPair>;
    /** Re-fetch current user from /auth/me. */
    readonly whoami: (client: AuthClient) => () => Promise<User>;
    /** Begin TOTP enrollment. */
    readonly setupTwoFactor: (client: AuthClient) => () => Promise<{
        secret: string;
        provisioningUri: string;
    }>;
    /** Confirm TOTP enrollment with the first code. */
    readonly enableTwoFactor: (client: AuthClient) => (code: string) => Promise<void>;
    /** Disable TOTP. */
    readonly disableTwoFactor: (client: AuthClient) => (params: {
        password: string;
        code: string;
    }) => Promise<void>;
    /** Impersonate another user. */
    readonly impersonate: (client: AuthClient) => (params: ImpersonateParams) => Promise<AuthResponse>;
    /** Hard-delete a user (system_admin only). */
    readonly hardDeleteUser: (client: AuthClient) => (params: {
        userId: string;
        reason: string;
    }) => Promise<void>;
    /** Request a password-reset email. Anonymous flow. */
    readonly requestPasswordReset: (client: AuthClient) => (params: {
        email: string;
        appCode?: string;
    }) => Promise<void>;
    /** Complete a password reset using a single-use token. */
    readonly resetPassword: (client: AuthClient) => (params: {
        token: string;
        newPassword: string;
    }) => Promise<void>;
    /** Change the current user's password. Authenticated. */
    readonly changePassword: (client: AuthClient) => (params: {
        currentPassword: string;
        newPassword: string;
    }) => Promise<void>;
    /** Consume an email-verification token. */
    readonly verifyEmail: (client: AuthClient) => (token: string) => Promise<void>;
    /** Re-issue a verification email. */
    readonly resendVerificationEmail: (client: AuthClient) => (params: {
        email: string;
        appCode?: string;
    }) => Promise<void>;
    /** List active sessions for the current user. */
    readonly getSessions: (client: AuthClient) => () => Promise<import("../../core/flows/sessions.flow.js").SessionRecord[]>;
    /** Terminate a specific session by id. */
    readonly terminateSession: (client: AuthClient) => (sessionId: string) => Promise<void>;
    /** Fetch the current user's organization memberships (self-service). */
    readonly getMyOrgs: (client: AuthClient) => () => Promise<import("../../core/types.js").MyOrgRecord[]>;
    /** Admin: bulk-resolve users by email/id. */
    readonly getUsersBulk: (client: AuthClient) => (req: {
        emails?: string[];
        ids?: string[];
    }) => Promise<import("@vendidit/auth-shared").LookupUserRecord[]>;
    /** Switch the active organization context for the current session. */
    readonly switchOrg: (client: AuthClient) => (organizationId: string) => Promise<TokenPair>;
    readonly getOrg: (client: AuthClient) => (orgId: string) => Promise<import("@vendidit/auth-shared").Organization>;
    readonly updateOrg: (client: AuthClient) => (params: {
        orgId: string;
        body: import("../../core/flows/org.flow.js").UpdateOrgRequest;
    }) => Promise<import("@vendidit/auth-shared").Organization>;
    readonly createOrg: (client: AuthClient) => (body: import("../../core/flows/org.flow.js").CreateOrgRequest) => Promise<import("@vendidit/auth-shared").Organization>;
    readonly deleteOrg: (client: AuthClient) => (orgId: string) => Promise<void>;
    /** Admin-pathed counterparts that hit `/admin/organizations/*`,
     *  intended for back-office UIs operated by non-member system_admins. */
    readonly adminGetOrg: (client: AuthClient) => (orgId: string) => Promise<import("@vendidit/auth-shared").Organization>;
    readonly adminUpdateOrg: (client: AuthClient) => (params: {
        orgId: string;
        body: import("../../core/flows/org.flow.js").UpdateOrgRequest;
    }) => Promise<import("@vendidit/auth-shared").Organization>;
    readonly adminListOrgMembers: (client: AuthClient) => (orgId: string) => Promise<import("@vendidit/auth-shared").OrgMemberRecord[]>;
    readonly adminSetOrgMemberRoles: (client: AuthClient) => (params: {
        orgId: string;
        userId: string;
        roleCodes: string[];
    }) => Promise<import("@vendidit/auth-shared").OrgMemberRecord>;
    readonly listOrgMembers: (client: AuthClient) => (orgId: string) => Promise<import("@vendidit/auth-shared").OrgMemberRecord[]>;
    readonly removeOrgMember: (client: AuthClient) => (params: {
        orgId: string;
        userId: string;
    }) => Promise<void>;
    readonly updateOrgMemberStatus: (client: AuthClient) => (params: {
        orgId: string;
        userId: string;
        status: string;
    }) => Promise<void>;
    readonly listOrgRoles: (client: AuthClient) => (orgId: string) => Promise<import("@vendidit/auth-shared").OrgRoleRecord[]>;
    readonly getOrgRole: (client: AuthClient) => (params: {
        orgId: string;
        roleId: string;
    }) => Promise<import("@vendidit/auth-shared").OrgRoleRecord>;
    readonly createOrgRole: (client: AuthClient) => (params: {
        orgId: string;
        body: import("../../core/flows/org.flow.js").CreateOrgRoleRequest;
    }) => Promise<import("@vendidit/auth-shared").OrgRoleRecord>;
    readonly updateOrgRole: (client: AuthClient) => (params: {
        orgId: string;
        roleId: string;
        body: import("../../core/flows/org.flow.js").UpdateOrgRoleRequest;
    }) => Promise<import("@vendidit/auth-shared").OrgRoleRecord>;
    readonly deleteOrgRole: (client: AuthClient) => (params: {
        orgId: string;
        roleId: string;
    }) => Promise<void>;
    readonly listAssignablePermissions: (client: AuthClient) => (orgId: string) => Promise<import("@vendidit/auth-shared").AssignablePermissionRecord[]>;
    readonly createInvitation: (client: AuthClient) => (params: {
        orgId: string;
        body: import("../../core/flows/org.flow.js").CreateInvitationRequest;
    }) => Promise<import("@vendidit/auth-shared").InvitationRecord>;
    readonly listOrgInvitations: (client: AuthClient) => (orgId: string) => Promise<import("@vendidit/auth-shared").InvitationRecord[]>;
    readonly revokeInvitation: (client: AuthClient) => (params: {
        orgId: string;
        invitationId: string;
    }) => Promise<void>;
    readonly listMyInvitations: (client: AuthClient) => () => Promise<import("@vendidit/auth-shared").InvitationRecord[]>;
    readonly acceptInvitation: (client: AuthClient) => (invitationId: string) => Promise<import("@vendidit/auth-shared").Organization | null>;
    readonly declineInvitation: (client: AuthClient) => (invitationId: string) => Promise<void>;
    /** Fetch the public app registration policy. Anonymous; UX hints only. */
    readonly getRegistrationPolicy: (client: AuthClient) => (appCode?: string) => Promise<import("@vendidit/auth-shared").RegistrationPolicy>;
    /** Admin: paginated list of users. */
    readonly listUsers: (client: AuthClient) => (req?: import("../../core/flows/admin.flow.js").ListUsersRequest) => Promise<import("../../core/flows/admin.flow.js").ListUsersResult>;
    /** Admin: list a target user's currently-assigned base roles. */
    readonly listUserRoles: (client: AuthClient) => (userId: string) => Promise<import("../../core/flows/admin.flow.js").UserRoleRecord[]>;
    /** Admin: replace a user's base roles. */
    readonly setUserRoles: (client: AuthClient) => (params: {
        userId: string;
        roleCodes: string[];
    }) => Promise<void>;
    /** Admin: reset a user's password. */
    readonly setUserPassword: (client: AuthClient) => (params: {
        userId: string;
        newPassword: string;
    }) => Promise<void>;
    /** Admin: list every active session for a target user. */
    readonly adminListUserSessions: (client: AuthClient) => (userId: string) => Promise<import("@vendidit/auth-shared").SessionRecord[]>;
    /** Admin: terminate one specific session for a target user. */
    readonly adminTerminateUserSession: (client: AuthClient) => (params: {
        userId: string;
        sessionId: string;
    }) => Promise<void>;
    /** Admin: terminate every session for a target user. */
    readonly adminRevokeUserSessions: (client: AuthClient) => (userId: string) => Promise<void>;
    /** Admin: clear a target user's failed-login lockout (count + lock). */
    readonly adminResetLockout: (client: AuthClient) => (userId: string) => Promise<void>;
    /** Request a magic-link sign-in email. Anonymous flow. */
    readonly requestMagicLink: (client: AuthClient) => (params: {
        email: string;
        appCode?: string;
    }) => Promise<void>;
    /** Verify a magic-link token and complete sign-in. */
    readonly verifyMagicLink: (client: AuthClient) => (token: string) => Promise<AuthResponse>;
    /** Admin: paginated audit-log query. */
    readonly listAuditLog: (client: AuthClient) => (q?: import("../../core/flows/audit-log.flow.js").AuditLogQuery) => Promise<import("@vendidit/auth-shared").AuditLogResult>;
    /** Self-service account deletion. Authenticated. */
    readonly deleteMyAccount: (client: AuthClient) => (currentPassword: string) => Promise<void>;
    readonly listAllOrgs: (client: AuthClient) => () => Promise<import("@vendidit/auth-shared").Organization[]>;
    readonly listApps: (client: AuthClient) => () => Promise<import("@vendidit/auth-shared").AppRecord[]>;
    readonly getApp: (client: AuthClient) => (appId: string) => Promise<import("@vendidit/auth-shared").AppRecord>;
    readonly createApp: (client: AuthClient) => (body: import("../../core/flows/apps.flow.js").CreateAppRequest) => Promise<import("@vendidit/auth-shared").AppRecord>;
    readonly updateApp: (client: AuthClient) => (params: {
        appId: string;
        body: import("../../core/flows/apps.flow.js").UpdateAppRequest;
    }) => Promise<import("@vendidit/auth-shared").AppRecord>;
    readonly deleteApp: (client: AuthClient) => (appId: string) => Promise<void>;
    readonly listNamespaces: (client: AuthClient) => (opts?: {
        forceRefresh?: boolean;
    }) => Promise<import("@vendidit/auth-shared").NamespaceInfo[]>;
    readonly getUserNamespaces: (client: AuthClient) => (userId: string) => Promise<import("@vendidit/auth-shared").UserNamespacesResponse>;
    readonly setUserHomeNamespace: (client: AuthClient) => (params: {
        userId: string;
        namespace: string;
    }) => Promise<void>;
    readonly addUserNamespace: (client: AuthClient) => (params: {
        userId: string;
        namespace: string;
    }) => Promise<void>;
    readonly removeUserNamespace: (client: AuthClient) => (params: {
        userId: string;
        namespace: string;
    }) => Promise<void>;
    readonly adminListUserApps: (client: AuthClient) => (userId: string) => Promise<import("@vendidit/auth-shared").AppRecord[]>;
    readonly adminGrantUserApp: (client: AuthClient) => (params: {
        userId: string;
        appId: string;
    }) => Promise<void>;
    readonly adminRevokeUserApp: (client: AuthClient) => (params: {
        userId: string;
        appId: string;
    }) => Promise<void>;
    readonly adminGetUserOrganizations: (client: AuthClient) => (userId: string) => Promise<import("@vendidit/auth-shared").AdminUserOrgMembership[]>;
    readonly adminRemoveOrgMember: (client: AuthClient) => (params: {
        orgId: string;
        userId: string;
    }) => Promise<void>;
    readonly adminAddOrgMember: (client: AuthClient) => (params: {
        orgId: string;
        userId: string;
        roleIds?: string[];
    }) => Promise<void>;
    readonly listM2MClients: (client: AuthClient) => () => Promise<import("@vendidit/auth-shared").M2MClientRecord[]>;
    readonly getM2MClient: (client: AuthClient) => (id: string) => Promise<import("@vendidit/auth-shared").M2MClientRecord>;
    readonly createM2MClient: (client: AuthClient) => (body: import("../../core/flows/m2m.flow.js").CreateM2MClientRequest) => Promise<import("@vendidit/auth-shared").CreateM2MClientResponse>;
    readonly revokeM2MClient: (client: AuthClient) => (id: string) => Promise<void>;
};
export type ActionName = keyof typeof ACTION_BINDINGS;
//# sourceMappingURL=action-bindings.d.ts.map