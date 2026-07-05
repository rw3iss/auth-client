/**
 * Action hooks — useLogin, useRegister, useLogout, etc. Each returns
 * `{ run, data, error, loading, isIdle, reset }` so a component can:
 *
 *   const login = useLogin();
 *   <form onSubmit={() => login.run({email, password})}>
 *     {login.loading && <Spinner />}
 *     {login.error && <Banner error={login.error} />}
 *   </form>
 *
 * One generic factory drives every action; the named exports are
 * one-liners on top so consumers get IntelliSense for the right
 * argument types per action.
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
//# sourceMappingURL=actions.d.ts.map