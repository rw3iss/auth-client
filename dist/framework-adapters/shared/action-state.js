/**
 * Shared adapter primitive: the "async action" state shape.
 *
 * Every framework adapter exposes action hooks/composables of the form
 * useLogin / useRegister / useStartSso / ... — these all share the same
 * loading/error/data lifecycle. Centralizing the type here keeps the
 * adapters identical from the consumer's perspective.
 *
 * Lifecycle:
 *
 *   idle           initial state, no call attempted yet
 *   ↓ run()
 *   loading        in-flight network call
 *   ↓ resolve / reject
 *   success        data set, error null
 *   error          data null, error set
 *   ↓ run() again
 *   loading …
 *
 * `reset()` flips back to idle without invoking the underlying op.
 * Useful when a UI wants to clear a stale error after the user
 * dismisses a message.
 */
/** Initial state — exported so adapters can use it as the seed for
 * their reactive primitive (useState / signal / ref). */
export const initialActionState = {
    data: null,
    error: null,
    loading: false,
    isIdle: true,
};
/**
 * Pure function that drives one action invocation. Adapters wrap this
 * with their framework's state primitive — React's setState, Solid's
 * signal setter, Vue's ref assignment. Keeping the logic here means a
 * bug fix lands in one place rather than five.
 *
 * Lifecycle hook contract: setState is called exactly three times per
 * invocation — once at start (loading=true), once on resolve/reject
 * (loading=false), and once if reset() fires.
 */
export async function runAction(op, setState, args) {
    setState({ data: null, error: null, loading: true, isIdle: false });
    try {
        const data = await op(...args);
        setState({ data, error: null, loading: false, isIdle: false });
        return data;
    }
    catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setState({ data: null, error, loading: false, isIdle: false });
        throw error;
    }
}
/**
 * Optimistic-update wrapper around runAction. Lets a caller flip the
 * UI to its hoped-for state immediately, run the actual operation, and
 * commit / rollback based on success / failure.
 *
 * Example (Preact, removing a member from a list):
 *
 *   const remove = useRemoveOrgMember();
 *   const onRemove = (id) => {
 *     setMembers((prev) => prev.filter((m) => m.id !== id));  // optimistic
 *     remove.run({ orgId, userId: id }).catch(() => {
 *       setMembers(snapshot);  // rollback on failure
 *     });
 *   };
 *
 * For a hook-level helper, framework adapters can wrap this with their
 * state primitive. The function itself stays framework-agnostic.
 *
 * Why split this from runAction: not every action is optimistic-safe
 * (a login can't be "optimistically successful" — you don't have the
 * tokens yet). Keeping the helper separate makes the choice explicit
 * at the call site.
 */
export async function runOptimisticAction(args) {
    const snap = args.snapshot();
    args.apply();
    args.setState({ data: null, error: null, loading: true, isIdle: false });
    try {
        const data = await args.op(...args.callArgs);
        args.setState({ data, error: null, loading: false, isIdle: false });
        return data;
    }
    catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        args.rollback(snap);
        args.setState({ data: null, error, loading: false, isIdle: false });
        throw error;
    }
}
//# sourceMappingURL=action-state.js.map