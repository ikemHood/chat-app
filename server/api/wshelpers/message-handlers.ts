import { db } from "../../../src/server/db";
import {
    publishMessage,
    publishTyping,
    publishDelivery,
} from "../../../src/server/pubsub";
import { isUserConnected, sendToUser } from "./clients";
import { generateAIResponse } from "../../../src/server/ai";
import { AI_BOT_ID } from "../../../src/constants";
import type { WsIncomingMessage } from "../../../src/types/websocket";

/**
 * Mark undelivered messages as delivered when user connects
 */
export async function markMessagesDelivered(userId: string): Promise<void> {
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

/**
 * Handle incoming WebSocket message
 */
export async function handleWsMessage(
    userId: string,
    data: WsIncomingMessage
): Promise<void> {
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
                    delivered: isUserConnected(receiverId),
                    deliveredAt: isUserConnected(receiverId) ? new Date() : null,
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
}
