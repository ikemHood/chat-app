/**
 * Custom Bun Server with WebSocket support
 * Uses Node.js http module for Next.js compatibility
 * WebSocket runs on a separate port for simplicity
 */

import "dotenv/config";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import next from "next";
import type { ServerWebSocket } from "bun";
import { auth } from "./src/server/better-auth/config";
import { db } from "./src/server/db";
import {
    pubsub,
    CHANNELS,
    publishMessage,
    publishStatus,
    publishTyping,
    publishDelivery,
    type ChatMessagePayload,
    type TypingPayload,
    type DeliveryPayload,
    type ReactionPayload,
} from "./src/server/pubsub";
import { generateAIResponse } from "./src/server/ai";
import type {
    WsData,
    WsOutgoingMessage,
    WsChatMessage,
    WsTypingMessage,
    WsReadMessage,
    WsIncomingMessage,
} from "./src/types/websocket";
import { AI_BOT_ID } from "./src/constants";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT ?? "3000", 10);
const wsPort = parseInt(process.env.WS_PORT ?? "3001", 10);

// Initialize Next.js
const app = next({ dev, hostname, port });
const nextHandler = app.getRequestHandler();

// Map userId -> Set<WebSocket>
const clients = new Map<string, Set<ServerWebSocket<WsData>>>();

// Send message to a specific user (all their connected tabs)
function sendToUser(userId: string, data: WsOutgoingMessage): void {
    const sockets = clients.get(userId);
    if (sockets) {
        const msg = JSON.stringify(data);
        for (const ws of sockets) {
            ws.send(msg);
        }
    }
}

// Broadcast to all connected clients
function broadcast(data: WsOutgoingMessage): void {
    const msg = JSON.stringify(data);
    for (const userSockets of clients.values()) {
        for (const ws of userSockets) {
            ws.send(msg);
        }
    }
}

// Handle incoming PubSub messages and relay to connected WebSocket clients
function setupPubSubHandlers(): void {
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
        // For simplicity, we broadcast to all for now
        broadcast({
            type: "REACTION",
            payload: msg,
        });
    });
}

// Mark undelivered messages as delivered when user connects
async function markMessagesDelivered(userId: string): Promise<void> {
    const now = new Date();

    // Find all conversations where this user is a participant
    const conversations = await db.conversation.findMany({
        where: {
            OR: [{ user1Id: userId }, { user2Id: userId }],
        },
        select: { id: true },
    });

    const conversationIds = conversations.map(c => c.id);

    // Mark messages in those conversations where user is NOT the sender
    await db.message.updateMany({
        where: {
            conversationId: { in: conversationIds },
            senderId: { not: userId },
            delivered: false,
        },
        data: {
            delivered: true,
            deliveredAt: now,
        },
    });
}

async function startServer(): Promise<void> {
    await app.prepare();
    await pubsub.connect();
    setupPubSubHandlers();

    // Create Node.js HTTP server for Next.js
    const httpServer = createServer(async (req: IncomingMessage, res: ServerResponse) => {
        try {
            await nextHandler(req, res);
        } catch (err) {
            console.error("Error handling request:", err);
            res.statusCode = 500;
            res.end("Internal Server Error");
        }
    });

    httpServer.listen(port, () => {
        console.log(`> Next.js ready on http://${hostname}:${port}`);
    });

    // Create Bun WebSocket server on separate port
    const wsServer = Bun.serve<WsData>({
        port: wsPort,
        async fetch(req, server) {
            const url = new URL(req.url);

            if (url.pathname === "/ws") {
                // Get token from query parameter (for cross-port auth)
                const token = url.searchParams.get("token");

                let userId: string | null = null;

                if (token) {
                    // Verify token by looking up session in database
                    const session = await db.session.findFirst({
                        where: {
                            token,
                            expiresAt: { gt: new Date() },
                        },
                        select: { userId: true },
                    });

                    if (session) {
                        userId = session.userId;
                    }
                }

                // Fallback to cookie-based auth (same-origin connections)
                if (!userId) {
                    const session = await auth.api.getSession({
                        headers: req.headers,
                    });
                    userId = session?.user?.id ?? null;
                }

                if (!userId) {
                    console.log("[WS] Authentication failed - no valid session");
                    return new Response("Unauthorized", { status: 401 });
                }

                const upgraded = server.upgrade(req, {
                    data: { userId },
                });

                return upgraded
                    ? undefined
                    : new Response("WebSocket upgrade failed", { status: 500 });
            }

            return new Response("WebSocket Server", { status: 200 });
        },

        websocket: {
            async open(ws) {
                const userId = ws.data.userId;

                // Register connection
                if (!clients.has(userId)) {
                    clients.set(userId, new Set());
                }
                clients.get(userId)!.add(ws);

                // Update user status to online
                await db.user.update({
                    where: { id: userId },
                    data: { isOnline: true, lastSeen: new Date() },
                });

                // Mark pending messages as delivered
                await markMessagesDelivered(userId);

                // Publish status change via PubSub (for other server instances)
                await publishStatus({
                    type: "STATUS_CHANGE",
                    userId,
                    isOnline: true,
                });

                console.log(`[WS] User ${userId} connected`);
            },

            async message(ws, message) {
                const userId = ws.data.userId;

                try {
                    const data = JSON.parse(
                        typeof message === "string" ? message : message.toString()
                    ) as WsIncomingMessage;

                    switch (data.type) {
                        case "CHAT": {
                            const { receiverId, content, tempId } = data.payload;

                            // Get or create conversation
                            const sortedIds = [userId, receiverId].sort();
                            const firstId = sortedIds[0]!;
                            const secondId = sortedIds[1]!;
                            let conversation = await db.conversation.findUnique({
                                where: { user1Id_user2Id: { user1Id: firstId, user2Id: secondId } },
                            });

                            if (!conversation) {
                                conversation = await db.conversation.create({
                                    data: { user1Id: firstId, user2Id: secondId, settings: {} },
                                });
                            }

                            // Save message
                            const savedMsg = await db.message.create({
                                data: {
                                    conversationId: conversation.id,
                                    senderId: userId,
                                    content,
                                    delivered: clients.has(receiverId),
                                    deliveredAt: clients.has(receiverId) ? new Date() : null,
                                },
                            });

                            // Update conversation timestamp
                            await db.conversation.update({
                                where: { id: conversation.id },
                                data: { updatedAt: new Date() },
                            });

                            // Publish via PubSub
                            await publishMessage({
                                type: "NEW_MESSAGE",
                                messageId: savedMsg.id,
                                senderId: userId,
                                receiverId,
                                content,
                                createdAt: savedMsg.createdAt.toISOString(),
                            });

                            // Send ack to sender
                            sendToUser(userId, {
                                type: "CHAT_ACK",
                                payload: {
                                    tempId,
                                    message: savedMsg,
                                    conversationId: conversation.id,
                                },
                            });

                            // Handle AI bot response
                            if (receiverId === AI_BOT_ID) {
                                console.log(`[AI] User ${userId} is messaging AI bot`);
                                void (async () => {
                                    try {
                                        console.log(`[AI] Generating response for: "${content.substring(0, 50)}..."`);
                                        const aiResponse = await generateAIResponse(content);
                                        console.log(`[AI] Got response: "${aiResponse.substring(0, 50)}..."`);

                                        const aiMessage = await db.message.create({
                                            data: {
                                                conversationId: conversation.id,
                                                senderId: AI_BOT_ID,
                                                content: aiResponse,
                                                delivered: true,
                                                deliveredAt: new Date(),
                                            },
                                        });
                                        console.log(`[AI] Saved message: ${aiMessage.id}`);

                                        await db.conversation.update({
                                            where: { id: conversation.id },
                                            data: { updatedAt: new Date() },
                                        });

                                        // Send directly to user via WebSocket (immediate delivery)
                                        sendToUser(userId, {
                                            type: "CHAT",
                                            payload: {
                                                id: aiMessage.id,
                                                content: aiResponse,
                                                senderId: AI_BOT_ID,
                                                receiverId: userId,
                                                createdAt: aiMessage.createdAt.toISOString(),
                                                delivered: true,
                                                read: false,
                                            },
                                        });
                                        console.log(`[AI] Sent to user ${userId} via WebSocket`);

                                        // Also publish via PubSub for other instances
                                        await publishMessage({
                                            type: "NEW_MESSAGE",
                                            messageId: aiMessage.id,
                                            senderId: AI_BOT_ID,
                                            receiverId: userId,
                                            content: aiResponse,
                                            createdAt: aiMessage.createdAt.toISOString(),
                                        });
                                    } catch (e) {
                                        console.error("[AI] Response error:", e);
                                    }
                                })();
                            }
                            break;
                        }

                        case "TYPING": {
                            const { receiverId, isTyping } = data.payload;
                            await publishTyping({
                                type: "TYPING",
                                userId,
                                peerId: receiverId,
                                isTyping,
                            });
                            break;
                        }

                        case "READ": {
                            const { peerId } = data.payload;

                            // Find conversation
                            const readSortedIds = [userId, peerId].sort();
                            const conversation = await db.conversation.findUnique({
                                where: { user1Id_user2Id: { user1Id: readSortedIds[0]!, user2Id: readSortedIds[1]! } },
                            });

                            if (conversation) {
                                const now = new Date();
                                await db.message.updateMany({
                                    where: {
                                        conversationId: conversation.id,
                                        senderId: peerId,
                                        read: false,
                                    },
                                    data: {
                                        read: true,
                                        readAt: now,
                                    },
                                });

                                // Publish read receipt
                                await publishDelivery({
                                    type: "READ",
                                    messageId: "",
                                    peerId,
                                    timestamp: now.toISOString(),
                                });
                            }
                            break;
                        }
                    }
                } catch (e) {
                    console.error("[WS] Message error:", e);
                }
            },

            async close(ws) {
                const userId = ws.data.userId;
                const userSockets = clients.get(userId);

                if (userSockets) {
                    userSockets.delete(ws);

                    if (userSockets.size === 0) {
                        clients.delete(userId);

                        await db.user.update({
                            where: { id: userId },
                            data: { isOnline: false, lastSeen: new Date() },
                        });

                        await publishStatus({
                            type: "STATUS_CHANGE",
                            userId,
                            isOnline: false,
                        });

                        console.log(`[WS] User ${userId} disconnected`);
                    }
                }
            },
        },
    });

    console.log(`> WebSocket server on ws://${hostname}:${wsPort}/ws`);
}

// Handle graceful shutdown
process.on("SIGINT", async () => {
    console.log("\nShutting down...");
    await pubsub.disconnect();
    process.exit(0);
});

startServer().catch((err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
});
