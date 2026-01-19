import { db } from "../../../src/server/db";
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

            // Send message directly to receiver's WebSocket
            sendToUser(receiverId, {
                type: "CHAT",
                payload: {
                    id: savedMsg.id,
                    content,
                    senderId: userId,
                    receiverId,
                    createdAt: savedMsg.createdAt.toISOString(),
                    delivered: true,
                    read: false,
                },
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

                        // Fetch history
                        const history = await db.message.findMany({
                            where: { conversationId: conversation.id },
                            orderBy: { createdAt: "desc" },
                            take: 20,
                        });

                        // Reverse to chronological order and format
                        type CoreMessage = {
                            role: "user" | "assistant" | "system";
                            content: string;
                        };

                        const formattedHistory: CoreMessage[] = history.reverse().map(msg => ({
                            role: msg.senderId === AI_BOT_ID ? "assistant" : "user",
                            content: msg.content,
                        }));

                        const aiResponse = await generateAIResponse(content, formattedHistory);
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

                    } catch (e) {
                        console.error("[AI] Response error:", e);
                    }
                })();
            }
            break;
        }

        case "TYPING": {
            const { receiverId, isTyping } = data.payload;

            // Send directly to receiver's WebSocket (same instance)
            sendToUser(receiverId, {
                type: "TYPING",
                payload: {
                    userId,
                    isTyping,
                },
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
            }
            break;
        }

        case "REACTION": {
            const { messageId, emoji, action } = data.payload;

            // 1. Get the message to verify existence and get sender/receiver
            const message = await db.message.findUnique({
                where: { id: messageId },
                include: { conversation: true }
            });

            if (!message) return;

            // 2. Update reactions in DB
            const reactions = (message.reactions as Record<string, string[]>) || {};
            const userIds = reactions[emoji] || [];

            let newUserIds = [...userIds];
            if (action === "add" && !newUserIds.includes(userId)) {
                newUserIds.push(userId);
            } else if (action === "remove") {
                newUserIds = newUserIds.filter(id => id !== userId);
            }

            const updatedReactions = {
                ...reactions,
                [emoji]: newUserIds
            };

            // Remove empty keys
            if (newUserIds.length === 0) {
                delete updatedReactions[emoji];
            }

            await db.message.update({
                where: { id: messageId },
                data: { reactions: updatedReactions },
            });

            // 3. Determine recipients (everyone in conversation)
            const recipient1 = message.conversation.user1Id;
            const recipient2 = message.conversation.user2Id;

            // 4. Broadcast to both users
            [recipient1, recipient2].forEach(recipientId => {
                sendToUser(recipientId, {
                    type: "REACTION",
                    payload: {
                        messageId,
                        userId,
                        emoji,
                        action,
                    },
                });
            });
            break;
        }
    }
}
