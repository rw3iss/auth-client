/**
 * Solid action helpers — same lifecycle as the React/Preact hooks but
 * built on createSignal.
 *
 *   const login = createLogin();
 *   login.run({ email, password });
 *   <Show when={login.loading()}>Signing in…</Show>
 *   <Show when={login.error()}>{login.error()!.message}</Show>
 *
 * Each accessor (data, error, loading, isIdle) is reactive; reads
 * inside a Solid effect / JSX track automatically.
 */
import { type Accessor } from 'solid-js';
import type { AuthClient } from '../../core/auth-client.js';
export interface SolidAction<TArgs extends unknown[], TResult> {
    /** Invoke the action. */
    run: (...args: TArgs) => Promise<TResult>;
    /** Clear data + error, flip back to idle. */
    reset: () => void;
    data: Accessor<TResult | null>;
    error: Accessor<Error | null>;
    loading: Accessor<boolean>;
    isIdle: Accessor<boolean>;
}
export declare const createLogin: (client?: AuthClient) => SolidAction<[params: import("../../index.js").LoginParams], import("@rw3iss/auth-shared").AuthResponse>;
export declare const createRegister: (client?: AuthClient) => SolidAction<[params: import("../../index.js").RegisterParams], import("@rw3iss/auth-shared").AuthResponse>;
export declare const createLogout: (client?: AuthClient) => SolidAction<[], void>;
export declare const createLogoutAll: (client?: AuthClient) => SolidAction<[], void>;
export declare const createStartSso: (client?: AuthClient) => SolidAction<[params: import("../../index.js").SsoStartParams], import("../../index.js").SsoStartResult>;
export declare const createCompleteSso: (client?: AuthClient) => SolidAction<[params: {
    code: string;
    state: string;
    provider?: string;
}], import("@rw3iss/auth-shared").AuthResponse>;
export declare const createRefreshTokens: (client?: AuthClient) => SolidAction<[], import("@rw3iss/auth-shared").TokenPair>;
export declare const createWhoami: (client?: AuthClient) => SolidAction<[], import("@rw3iss/auth-shared").User>;
export declare const createSetupTwoFactor: (client?: AuthClient) => SolidAction<[], {
    secret: string;
    provisioningUri: string;
}>;
export declare const createEnableTwoFactor: (client?: AuthClient) => SolidAction<[code: string], void>;
export declare const createDisableTwoFactor: (client?: AuthClient) => SolidAction<[params: {
    password: string;
    code: string;
}], void>;
export declare const createImpersonate: (client?: AuthClient) => SolidAction<[params: import("../../index.js").ImpersonateParams], import("@rw3iss/auth-shared").AuthResponse>;
export declare const createHardDeleteUser: (client?: AuthClient) => SolidAction<[params: {
    userId: string;
    reason: string;
}], void>;
//# sourceMappingURL=actions.d.ts.map