/** @jsxImportSource preact */
import { useState } from 'preact/hooks';
import { useGetUsersBulk } from '../../actions.js';
import type { LookupUserRecord } from '../../../../core/flows/admin.flow.js';
import type { AuthClient } from '../../../../core/auth-client.js';

/**
 * Admin tool — paste a list of emails (or ids), hit Look up, render
 * the result table. Backed by POST /admin/users/lookup. Requires
 * an admin token; the form surfaces a 403 as a clear error.
 *
 * Designed for back-office workflows where someone has a spreadsheet
 * of identifiers and needs to inspect those accounts.
 */
export interface UserLookupTableProps {
    client?: AuthClient;
    /** Default placeholder text for the input. */
    placeholder?: string;
    className?: string;
}

export function UserLookupTable(props: UserLookupTableProps) {
    const action = useGetUsersBulk(props.client);
    const [input, setInput] = useState('');
    const [results, setResults] = useState<LookupUserRecord[]>([]);

    const onSubmit = async (e: Event) => {
        e.preventDefault();
        const tokens = input.split(/[\s,;]+/).map((s) => s.trim()).filter(Boolean);
        const emails = tokens.filter((t) => t.includes('@'));
        const ids = tokens.filter((t) => !t.includes('@'));
        const found = await action.run({ emails, ids });
        setResults(found);
    };

    return (
        <div class={`vauth-user-lookup ${props.className ?? ''}`}>
            <form onSubmit={onSubmit}>
                <label class="vauth-field">
                    <span class="vauth-field-label">Emails or user ids (one per line, or comma-separated)</span>
                    <textarea
                        class="vauth-input"
                        rows={4}
                        placeholder={props.placeholder ?? 'alice@example.com\nbob@example.com\nb12c…'}
                        value={input}
                        onInput={(e) => setInput((e.target as HTMLTextAreaElement).value)}
                        disabled={action.loading}
                    />
                </label>
                {action.error && <div class="vauth-error" role="alert">{action.error.message}</div>}
                <button
                    type="submit"
                    class="vauth-btn vauth-btn-primary"
                    disabled={action.loading || input.trim() === ''}
                    aria-busy={action.loading}
                >
                    {action.loading ? 'Looking up…' : 'Look up'}
                </button>
            </form>
            {results.length > 0 && (
                <table class="vauth-user-lookup-table">
                    <thead>
                        <tr>
                            <th>Email</th>
                            <th>Name</th>
                            <th>Status</th>
                            <th>Verified</th>
                            <th>Provider</th>
                        </tr>
                    </thead>
                    <tbody>
                        {results.map((u) => (
                            <tr key={u.id}>
                                <td>{u.email}</td>
                                <td>{u.display_name ?? (`${u.first_name ?? ''} ${u.last_name ?? ''}`.trim() || '—')}</td>
                                <td>{u.status ?? '—'}</td>
                                <td>{u.email_verified ? '✓' : '—'}</td>
                                <td>{u.auth_provider ?? '—'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            {action.data && results.length === 0 && (
                <div class="vauth-user-lookup-empty">No matches.</div>
            )}
        </div>
    );
}
