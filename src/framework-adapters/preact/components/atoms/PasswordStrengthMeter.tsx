/** @jsxImportSource preact */

/**
 * Inline password-strength bar. Pure-function scorer — no zxcvbn / no
 * dictionaries — so the bundle stays light. The score reflects four
 * heuristics that match the auth-server's default password policy:
 * length, mixed case, digits, and a small set of symbols. Operators
 * who run a stricter or laxer policy can pass their own `score` fn.
 *
 * Renders nothing when `password` is empty so the form doesn't show a
 * "weak" red bar on first focus.
 *
 * Composition: callers typically render this inside a password field's
 * label or just below the input. It's not opinionated about layout —
 * the consumer's CSS wraps it.
 */
export interface PasswordStrengthMeterProps {
    password: string;
    /** Custom scorer. Receives the raw password, returns 0–4. */
    score?: (pw: string) => number;
    /** Hide the score label (just the bar). Default false. */
    barOnly?: boolean;
    className?: string;
}

export type PasswordScore = 0 | 1 | 2 | 3 | 4;

/**
 * Default scorer. Each criterion contributes one point up to 4:
 *   - length ≥ 8
 *   - mix of upper + lower case
 *   - contains a digit
 *   - contains a symbol
 * A password ≥ 16 chars gets a +1 bonus (capped at 4) — long
 * passphrases are stronger than short complex ones.
 */
export function defaultPasswordScore(pw: string): PasswordScore {
    if (!pw) return 0;
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
    if (/\d/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    if (pw.length >= 16) score = Math.min(4, score + 1);
    return score as PasswordScore;
}

const LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong'] as const;

export function PasswordStrengthMeter(props: PasswordStrengthMeterProps) {
    if (!props.password) return null;
    const score = (props.score ?? defaultPasswordScore)(props.password);
    const pct = (score / 4) * 100;
    return (
        <div class={`vauth-pw-meter vauth-pw-meter-${score} ${props.className ?? ''}`}>
            <div class="vauth-pw-meter-bar" aria-hidden="true">
                <div class="vauth-pw-meter-fill" style={{ width: `${pct}%` }} />
            </div>
            {!props.barOnly && (
                <span class="vauth-pw-meter-label">{LABELS[score]}</span>
            )}
        </div>
    );
}
