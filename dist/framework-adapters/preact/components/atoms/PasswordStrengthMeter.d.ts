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
export declare function defaultPasswordScore(pw: string): PasswordScore;
export declare function PasswordStrengthMeter(props: PasswordStrengthMeterProps): import("preact").JSX.Element | null;
//# sourceMappingURL=PasswordStrengthMeter.d.ts.map