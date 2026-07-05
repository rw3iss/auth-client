import { jsx as _jsx, jsxs as _jsxs } from "preact/jsx-runtime";
/**
 * Default scorer. Each criterion contributes one point up to 4:
 *   - length ≥ 8
 *   - mix of upper + lower case
 *   - contains a digit
 *   - contains a symbol
 * A password ≥ 16 chars gets a +1 bonus (capped at 4) — long
 * passphrases are stronger than short complex ones.
 */
export function defaultPasswordScore(pw) {
    if (!pw)
        return 0;
    let score = 0;
    if (pw.length >= 8)
        score++;
    if (/[a-z]/.test(pw) && /[A-Z]/.test(pw))
        score++;
    if (/\d/.test(pw))
        score++;
    if (/[^A-Za-z0-9]/.test(pw))
        score++;
    if (pw.length >= 16)
        score = Math.min(4, score + 1);
    return score;
}
const LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong'];
export function PasswordStrengthMeter(props) {
    if (!props.password)
        return null;
    const score = (props.score ?? defaultPasswordScore)(props.password);
    const pct = (score / 4) * 100;
    return (_jsxs("div", { class: `vauth-pw-meter vauth-pw-meter-${score} ${props.className ?? ''}`, children: [_jsx("div", { class: "vauth-pw-meter-bar", "aria-hidden": "true", children: _jsx("div", { class: "vauth-pw-meter-fill", style: { width: `${pct}%` } }) }), !props.barOnly && (_jsx("span", { class: "vauth-pw-meter-label", children: LABELS[score] }))] }));
}
//# sourceMappingURL=PasswordStrengthMeter.js.map