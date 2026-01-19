import {
    pubsub,
    CHANNELS,
    type ChatMessagePayload,
    type TypingPayload,
    type DeliveryPayload,
    type ReactionPayload,
} from "../../../src/server/pubsub";
import { sendToUser, broadcast } from "./clients";

/**
 * Setup handlers for PubSub messages and relay to connected WebSocket clients
 */
export function setupPubSubHandlers(): void {
    // Chat messages
    pubsub.subscribe(CHANNELS.CHAT_MESSAGE, (payload) => {
        const msg = payload as ChatMessagePayload;
        // Send to receiver
        sendToUser(msg.receiverId, {
            type: "CHAT",
            payload: {
                id: msg.messageId,
                content: msg.content,
                senderId: msg.senderId,
                receiverId: msg.receiverId,
                createdAt: msg.createdAt,
            },
        });
        // Send ack to sender (in case they have multiple tabs)
        sendToUser(msg.senderId, {
            type: "CHAT_SENT",
            payload: {
                id: msg.messageId,
                receiverId: msg.receiverId,
            },
        });
    });

    // User status changes
    pubsub.subscribe(CHANNELS.USER_STATUS, (payload) => {
        broadcast({
            type: "STATUS",
            payload: {
                userId: (payload as { userId: string }).userId,
                isOnline: (payload as { isOnline: boolean }).isOnline,
            },
        });
    });

    // Typing indicators
    pubsub.subscribe(CHANNELS.TYPING, (payload) => {
        const msg = payload as TypingPayload;
        sendToUser(msg.peerId, {
            type: "TYPING",
            payload: {
                userId: msg.userId,
                isTyping: msg.isTyping,
            },
        });
    });

    // Delivery/Read receipts
    pubsub.subscribe(CHANNELS.DELIVERY, (payload) => {
        const msg = payload as DeliveryPayload;
        sendToUser(msg.peerId, {
            type: msg.type === "READ" ? "READ_RECEIPT" : "DELIVERED",
            payload: {
                messageId: msg.messageId,
                timestamp: msg.timestamp,
            },
        });
    });

    // Reactions
    pubsub.subscribe(CHANNELS.REACTION, (payload) => {
        const msg = payload as ReactionPayload;
        // Broadcast to both sender and receiver of the message
        broadcast({
            type: "REACTION",
            payload: msg,
        });
    });
}
