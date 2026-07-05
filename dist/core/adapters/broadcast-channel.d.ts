/**
 * Cross-tab Broadcast adapters.
 *
 * Two default impls:
 *   - BroadcastChannelAdapter: uses the BroadcastChannel API. Modern
 *     browsers, single-origin scope. The clean way to sync auth state
 *     across tabs.
 *   - NoOpBroadcast: silent no-op. Used in SSR / older browsers (Safari
 *     <15.4 lacked BroadcastChannel; same for older Firefox).
 *
 * The pattern that uses these: when AuthClient transitions to/from
 * authenticated, it publishes a message. Other tabs subscribe to the
 * same channel and reload their token store + emit their own
 * "authenticated"/"logged_out" event, keeping every tab consistent
 * without each one doing its own /auth/refresh.
 *
 * Why not localStorage events as a fallback? The `storage` event fires
 * across tabs when localStorage changes — but it doesn't fire in the
 * tab that made the change, doesn't carry rich payloads cleanly, and
 * doesn't compose with the structured message types we use here.
 * BroadcastChannel-or-nothing is the cleaner contract.
 */
import type { Broadcast, BroadcastMessage } from '../types.js';
export declare class BroadcastChannelAdapter implements Broadcast {
    private readonly channel;
    private readonly handlers;
    constructor(channelName?: string);
    publish(message: BroadcastMessage): void;
    subscribe(handler: (message: BroadcastMessage) => void): () => void;
    close(): void;
}
export declare class NoOpBroadcast implements Broadcast {
    publish(): void;
    subscribe(): () => void;
    close(): void;
}
/**
 * Factory — returns BroadcastChannelAdapter when the API is available,
 * NoOpBroadcast otherwise. Saves consumers from a feature-detect dance.
 */
export declare function createDefaultBroadcast(): Broadcast;
//# sourceMappingURL=broadcast-channel.d.ts.map