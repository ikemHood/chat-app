/**
 * Chat message payload from server
 */
export interface WsChatPayload {
    id: string;
    content: string;
    senderId: string;
    receiverId: string;
    createdAt: string;
    delivered?: boolean;
    read?: boolean;
}

/**
 * Typing indicator payload
 */
export interface WsTypingPayload {
    userId: string;
    isTyping: boolean;
}

/**
 * User online status payload
 */
export interface WsStatusPayload {
    userId: string;
    isOnline: boolean;
}

/**
 * Message delivered confirmation payload
 */
export interface WsDeliveredPayload {
    messageId: string;
    timestamp: string;
}

/**
 * Read receipt payload
 */
export interface WsReadReceiptPayload {
    messageId: string;
    timestamp: string;
}

/**
 * Chat acknowledgement payload (confirms message saved)
 */
export interface WsChatAckPayload {
    tempId: string;
    message: WsChatPayload;
}

/**
 * Reaction update payload
 */
export interface WsReactionPayload {
    messageId: string;
    userId: string;
    emoji: string;
    action: "add" | "remove";
}

/**
 * All possible messages from server to client
 */
export type WsMessage =
    | { type: "CHAT"; payload: WsChatPayload }
    | { type: "CHAT_ACK"; payload: WsChatAckPayload }
    | { type: "TYPING"; payload: WsTypingPayload }
    | { type: "STATUS"; payload: WsStatusPayload }
    | { type: "DELIVERED"; payload: WsDeliveredPayload }
    | { type: "READ_RECEIPT"; payload: WsReadReceiptPayload }
    | { type: "REACTION"; payload: WsReactionPayload };

/**
 * Chat message from client
 */
export interface WsChatMessage {
    type: "CHAT";
    payload: {
        receiverId: string;
        content: string;
        tempId: string;
    };
}

/**
 * Typing indicator from client
 */
export interface WsTypingMessage {
    type: "TYPING";
    payload: {
        receiverId: string;
        isTyping: boolean;
    };
}

/**
 * Read receipt from client
 */
export interface WsReadMessage {
    type: "READ";
    payload: {
        peerId: string;
    };
}

/**
 * All possible messages from client to server
 */
export type WsIncomingMessage = WsChatMessage | WsTypingMessage | WsReadMessage;

/**
 * Data attached to each WebSocket connection
 */
export interface WsData {
    userId: string;
}

/**
 * Generic outgoing message wrapper
 */
export interface WsOutgoingMessage {
    type: string;
    payload: unknown;
}
