/**
 * PostgreSQL Pub/Sub Layer using LISTEN/NOTIFY
 * Enables real-time communication across server instances
 */

import { Pool, type PoolClient } from "pg";

// Pub/Sub channels
export const CHANNELS = {
    CHAT_MESSAGE: "chat_messages",
    USER_STATUS: "user_status",
    TYPING: "typing",
    REACTION: "reactions",
    DELIVERY: "delivery",
} as const;

export type Channel = (typeof CHANNELS)[keyof typeof CHANNELS];

// Message payload types
export interface ChatMessagePayload {
    type: "NEW_MESSAGE";
    messageId: string;
    senderId: string;
    receiverId: string;
    content: string;
    createdAt: string;
}

export interface UserStatusPayload {
    type: "STATUS_CHANGE";
    userId: string;
    isOnline: boolean;
}

export interface TypingPayload {
    type: "TYPING";
    userId: string;
    peerId: string;
    isTyping: boolean;
}

export interface ReactionPayload {
    type: "REACTION";
    messageId: string;
    userId: string;
    emoji: string;
    action: "add" | "remove";
}

export interface DeliveryPayload {
    type: "DELIVERED" | "READ";
    messageId: string;
    peerId: string;
    timestamp: string;
}

export type PubSubPayload =
    | ChatMessagePayload
    | UserStatusPayload
    | TypingPayload
    | ReactionPayload
    | DeliveryPayload;

type MessageHandler = (payload: PubSubPayload) => void;

class PostgresPubSub {
    private pool: Pool;
    private client: PoolClient | null = null;
    private handlers = new Map<Channel, Set<MessageHandler>>();
    private isConnected = false;
    private reconnectTimer: Timer | null = null;

    constructor() {
        this.pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            // Use a dedicated connection for LISTEN, not pooled
            max: 1,
        });
    }

    async connect(): Promise<void> {
        if (this.isConnected) return;

        try {
            this.client = await this.pool.connect();
            this.isConnected = true;

            // Set up notification handler
            this.client.on("notification", (msg) => {
                if (!msg.payload) return;

                try {
                    const payload = JSON.parse(msg.payload) as PubSubPayload;
                    const channel = msg.channel as Channel;
                    const handlers = this.handlers.get(channel);

                    if (handlers) {
                        for (const handler of handlers) {
                            try {
                                handler(payload);
                            } catch (e) {
                                console.error("PubSub handler error:", e);
                            }
                        }
                    }
                } catch (e) {
                    console.error("PubSub parse error:", e);
                }
            });

            // Handle disconnection
            this.client.on("error", (err) => {
                console.error("PubSub connection error:", err);
                this.isConnected = false;
                this.scheduleReconnect();
            });

            // Subscribe to all channels
            for (const channel of Object.values(CHANNELS)) {
                await this.client.query(`LISTEN ${channel}`);
            }

            console.log("PubSub: Connected and listening");
        } catch (e) {
            console.error("PubSub connection failed:", e);
            this.scheduleReconnect();
        }
    }

    private scheduleReconnect(): void {
        if (this.reconnectTimer) return;

        this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = null;
            void this.connect();
        }, 5000);
    }

    async publish(channel: Channel, payload: PubSubPayload): Promise<void> {
        try {
            // Use a separate pooled connection for publishing
            const client = await this.pool.connect();
            try {
                await client.query(`SELECT pg_notify($1, $2)`, [
                    channel,
                    JSON.stringify(payload),
                ]);
            } finally {
                client.release();
            }
        } catch (e) {
            console.error("PubSub publish error:", e);
        }
    }

    subscribe(channel: Channel, handler: MessageHandler): () => void {
        if (!this.handlers.has(channel)) {
            this.handlers.set(channel, new Set());
        }

        this.handlers.get(channel)!.add(handler);

        // Return unsubscribe function
        return () => {
            this.handlers.get(channel)?.delete(handler);
        };
    }

    async disconnect(): Promise<void> {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }

        if (this.client) {
            this.client.release();
            this.client = null;
        }

        this.isConnected = false;
        await this.pool.end();
    }
}

// Singleton instance
export const pubsub = new PostgresPubSub();

// Helper functions for common operations
export async function publishMessage(
    payload: ChatMessagePayload
): Promise<void> {
    await pubsub.publish(CHANNELS.CHAT_MESSAGE, payload);
}

export async function publishStatus(payload: UserStatusPayload): Promise<void> {
    await pubsub.publish(CHANNELS.USER_STATUS, payload);
}

export async function publishTyping(payload: TypingPayload): Promise<void> {
    await pubsub.publish(CHANNELS.TYPING, payload);
}

export async function publishReaction(payload: ReactionPayload): Promise<void> {
    await pubsub.publish(CHANNELS.REACTION, payload);
}

export async function publishDelivery(payload: DeliveryPayload): Promise<void> {
    await pubsub.publish(CHANNELS.DELIVERY, payload);
}
