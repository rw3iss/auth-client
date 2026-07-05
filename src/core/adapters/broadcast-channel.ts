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

const CHANNEL_NAME = 'vendidit_auth';

export class BroadcastChannelAdapter implements Broadcast {
    private readonly channel: BroadcastChannel;
    private readonly handlers = new Set<(m: BroadcastMessage) => void>();

    constructor(channelName: string = CHANNEL_NAME) {
        this.channel = new BroadcastChannel(channelName);
        this.channel.onmessage = (event: MessageEvent<BroadcastMessage>) => {
            if (!isBroadcastMessage(event.data)) return;
            // Snapshot the handler set so an unsubscribe during dispatch
            // doesn't break iteration.
            for (const handler of Array.from(this.handlers)) {
                try {
                    handler(event.data);
                } catch {
                    // Subscribers MUST NOT throw; if one does, swallow so
                    // a buggy listener can't block other listeners.
                }
            }
        };
    }

    publish(message: BroadcastMessage): void {
        this.channel.postMessage(message);
    }

    subscribe(handler: (message: BroadcastMessage) => void): () => void {
        this.handlers.add(handler);
        return () => {
            this.handlers.delete(handler);
        };
    }

    close(): void {
        this.handlers.clear();
        this.channel.close();
    }
}

export class NoOpBroadcast implements Broadcast {
    publish(): void {}
    subscribe(): () => void {
        return () => {};
    }
    close(): void {}
}

/**
 * Factory — returns BroadcastChannelAdapter when the API is available,
 * NoOpBroadcast otherwise. Saves consumers from a feature-detect dance.
 */
export function createDefaultBroadcast(): Broadcast {
    if (typeof globalThis.BroadcastChannel === 'function') {
        return new BroadcastChannelAdapter();
    }
    return new NoOpBroadcast();
}

function isBroadcastMessage(data: unknown): data is BroadcastMessage {
    if (typeof data !== 'object' || data === null) return false;
    const m = data as { type?: unknown };
    return (
        m.type === 'authenticated' ||
        m.type === 'logged_out' ||
        m.type === 'token_refreshed'
    );
}
