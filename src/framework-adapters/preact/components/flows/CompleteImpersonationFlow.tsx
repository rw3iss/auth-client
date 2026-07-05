/** @jsxImportSource preact */
import { useState } from 'preact/hooks';
import { useImpersonate } from '../../actions.js';
import { useAuth } from '../../hooks.js';
import type { AuthClient } from '../../../../core/auth-client.js';
import type { AuthResponse } from '../../../../core/types.js';

/**
 * Admin impersonation start-form: pick a user id, supply a reason,
 * issue impersonation tokens. The current session is replaced with
 * the impersonation token-pair; downstream UI reacts via the auth
 * snapshot.
 *
 * Reads `isImpersonating` from the snapshot so a re-mount after the
 * impersonation starts renders the "exit impersonation" panel. The
 * exit affordance fires `logoutCurrent()` which clears the
 * impersonation token; the admin's original session does NOT
 * automatically restore — that's by design (server-side, impersonation
 * is a fresh session, not a stack push). Admins re-login after.
 *
 * Required permission: `system_admin`, `super_admin`, or an `org_admin`
 * impersonating a user in their own org. Server enforces; this UI
 * shows the server's 403 message verbatim.
 */
export interface CompleteImpersonationFlowProps {
    client?: AuthClient;
    onStarted?: (resp: AuthResponse) => void;
    className?: string;
}

export function CompleteImpersonationFlow(props: CompleteImpersonationFlowProps) {
    const snap = useAuth(props.client);
    const impersonate = useImpersonate(props.client);
    const [userId, setUserId] = useState('');
    const [reason, setReason] = useState('');

    if (snap.isImpersonating) {
        return (
            <div class={`vauth-flow vauth-flow-impersonating ${props.className ?? ''}`} role="status">
                <header class="vauth-flow-header">
                    <h1>You are impersonating</h1>
                    <p class="vauth-flow-sub">
                        Acting as <strong>{snap.user?.email ?? '…'}</strong> from
                        <strong> {snap.claims?.imp_email ?? 'unknown admin'}</strong>.
                    </p>
                </header>
                <p class="vauth-flow-text">
                    To return to your own session, sign out and sign back in as yourself.
                </p>
            </div>
        );
    }

    const onSubmit = async (e: Event) => {
        e.preventDefault();
        const resp = await impersonate.run({ targetUserId: userId, reason });
        props.onStarted?.(resp);
    };

    return (
        <div class={`vauth-flow vauth-flow-impersonate ${props.className ?? ''}`}>
            <header class="vauth-flow-header">
                <h1>Impersonate a user</h1>
                <p class="vauth-flow-sub">For support / debugging. Every action is audited under your name.</p>
            </header>
            <form onSubmit={onSubmit}>
                <label class="vauth-field">
                    <span class="vauth-field-label">Target user id</span>
                    <input
                        class="vauth-input"
                        type="text"
                        required
                        value={userId}
                        onInput={(e) => setUserId((e.target as HTMLInputElement).value)}
                        disabled={impersonate.loading}
                    />
                </label>
                <label class="vauth-field">
                    <span class="vauth-field-label">Reason (required for audit log)</span>
                    <input
                        class="vauth-input"
                        type="text"
                        required
                        minLength={3}
                        value={reason}
                        onInput={(e) => setReason((e.target as HTMLInputElement).value)}
                        disabled={impersonate.loading}
                    />
                </label>
                {impersonate.error && <div class="vauth-error" role="alert">{impersonate.error.message}</div>}
                <button
                    type="submit"
                    class="vauth-btn vauth-btn-danger"
                    disabled={impersonate.loading}
                    aria-busy={impersonate.loading}
                >
                    {impersonate.loading ? 'Starting…' : 'Begin impersonation'}
                </button>
            </form>
        </div>
    );
}
