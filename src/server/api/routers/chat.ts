import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import type { Prisma, PrismaClient } from "../../../../generated/prisma";
import { AI_BOT_ID } from "@/constants";

// Helper to get or create conversation between two users
async function getOrCreateConversation(
    db: PrismaClient,
    user1Id: string,
    user2Id: string
) {
    // Ensure consistent ordering for unique constraint
    const sortedIds = [user1Id, user2Id].sort();
    const firstId = sortedIds[0]!;
    const secondId = sortedIds[1]!;

    let conversation = await db.conversation.findUnique({
        where: {
            user1Id_user2Id: { user1Id: firstId, user2Id: secondId },
        },
    });

    conversation ??= await db.conversation.create({
        data: {
            user1Id: firstId,
            user2Id: secondId,
            settings: {},
        },
    });

    return conversation;
}

// Helper to get user settings from conversation
function getUserSettings(
    settings: Record<string, { archived?: boolean; muted?: boolean; pinned?: boolean }>,
    userId: string
) {
    return settings[userId] ?? { archived: false, muted: false, pinned: false };
}

export const chatRouter = createTRPCRouter({
    // Search users for new message
    searchUsers: protectedProcedure
        .input(z.object({
            query: z.string().min(1),
            limit: z.number().min(1).max(50).default(10),
            cursor: z.string().optional(),
        }))
        .query(async ({ ctx, input }) => {
            const users = await ctx.db.user.findMany({
                take: input.limit + 1,
                where: {
                    OR: [
                        { name: { contains: input.query, mode: "insensitive" } },
                        { email: { contains: input.query, mode: "insensitive" } },
                    ],
                    NOT: { id: ctx.session.user.id },
                },
                cursor: input.cursor ? { id: input.cursor } : undefined,
                orderBy: { name: "asc" },
                select: {
                    id: true,
                    name: true,
                    image: true,
                    isOnline: true,
                    lastSeen: true,
                    email: true,
                },
            });

            let nextCursor: string | undefined;
            if (users.length > input.limit) {
                const nextItem = users.pop();
                nextCursor = nextItem!.id;
            }

            return { users, nextCursor };
        }),

    // Get all conversations for current user
    getConversations: protectedProcedure
        .input(z.object({
            includeArchived: z.boolean().default(false),
        }).optional())
        .query(async ({ ctx, input }) => {
            const userId = ctx.session.user.id;
            const includeArchived = input?.includeArchived ?? false;

            // Get all conversations where user is participant
            const conversations = await ctx.db.conversation.findMany({
                where: {
                    OR: [{ user1Id: userId }, { user2Id: userId }],
                },
                include: {
                    user1: {
                        select: { id: true, name: true, image: true, isOnline: true, lastSeen: true, email: true },
                    },
                    user2: {
                        select: { id: true, name: true, image: true, isOnline: true, lastSeen: true, email: true },
                    },
                    messages: {
                        take: 1,
                        orderBy: { createdAt: "desc" },
                    },
                },
                orderBy: { updatedAt: "desc" },
            });

            // Process and filter
            const results = await Promise.all(
                conversations.map(async (conv) => {
                    const settings = conv.settings as Record<string, { archived?: boolean; muted?: boolean; pinned?: boolean }>;
                    const userSettings = getUserSettings(settings, userId);

                    // Filter archived if needed
                    if (!includeArchived && userSettings.archived) {
                        return null;
                    }

                    // Determine peer (the other user)
                    const peer = conv.user1Id === userId ? conv.user2 : conv.user1;
                    const lastMessage = conv.messages[0];

                    // Count unread messages from peer
                    const unreadCount = await ctx.db.message.count({
                        where: {
                            conversationId: conv.id,
                            senderId: peer.id,
                            read: false,
                        },
                    });

                    return {
                        id: conv.id,
                        user: peer,
                        lastMessage: lastMessage ?? null,
                        unreadCount,
                        isPinned: userSettings.pinned ?? false,
                        isMuted: userSettings.muted ?? false,
                        isArchived: userSettings.archived ?? false,
                    };
                })
            );

            // Filter nulls and sort (pinned first, then by last message)
            return results
                .filter((r): r is NonNullable<typeof r> => r !== null)
                .sort((a, b) => {
                    if (a.isPinned && !b.isPinned) return -1;
                    if (!a.isPinned && b.isPinned) return 1;
                    const aTime = a.lastMessage?.createdAt.getTime() ?? 0;
                    const bTime = b.lastMessage?.createdAt.getTime() ?? 0;
                    return bTime - aTime;
                });
        }),

    // Get messages for a conversation
    getMessages: protectedProcedure
        .input(z.object({
            conversationId: z.string().optional(),
            peerId: z.string().optional(), // For backward compatibility
            limit: z.number().min(1).max(50).default(50),
            cursor: z.string().optional(),
        }))
        .query(async ({ ctx, input }) => {
            const userId = ctx.session.user.id;
            let conversationId = input.conversationId;

            // If peerId provided, find or create conversation
            if (!conversationId && input.peerId) {
                const conversation = await getOrCreateConversation(ctx.db, userId, input.peerId);
                conversationId = conversation.id;
            }

            if (!conversationId) {
                return { messages: [], nextCursor: undefined, conversationId: null };
            }

            const messages = await ctx.db.message.findMany({
                take: input.limit + 1,
                where: { conversationId },
                cursor: input.cursor ? { id: input.cursor } : undefined,
                orderBy: { createdAt: "desc" },
            });

            let nextCursor: string | undefined;
            if (messages.length > input.limit) {
                const nextItem = messages.pop();
                nextCursor = nextItem!.id;
            }

            return {
                messages: messages.reverse(),
                nextCursor,
                conversationId,
            };
        }),

    // Send a message
    sendMessage: protectedProcedure
        .input(z.object({
            receiverId: z.string(),
            content: z.string().min(1),
            conversationId: z.string().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            const userId = ctx.session.user.id;

            // Get or create conversation
            let conversation;
            if (input.conversationId) {
                conversation = await ctx.db.conversation.findUnique({
                    where: { id: input.conversationId },
                });
                if (!conversation) {
                    throw new TRPCError({ code: "NOT_FOUND", message: "Conversation not found" });
                }
            } else {
                conversation = await getOrCreateConversation(ctx.db, userId, input.receiverId);
            }

            // Create message
            const message = await ctx.db.message.create({
                data: {
                    conversationId: conversation.id,
                    senderId: userId,
                    content: input.content,
                },
            });

            // Update conversation timestamp
            await ctx.db.conversation.update({
                where: { id: conversation.id },
                data: { updatedAt: new Date() },
            });

            // Handle AI bot response
            if (input.receiverId === AI_BOT_ID) {
                void (async () => {
                    try {
                        const { generateAIResponse } = await import("@/server/ai");
                        const response = await generateAIResponse(input.content);

                        await ctx.db.message.create({
                            data: {
                                conversationId: conversation.id,
                                senderId: AI_BOT_ID,
                                content: response,
                                delivered: true,
                                deliveredAt: new Date(),
                            },
                        });

                        await ctx.db.conversation.update({
                            where: { id: conversation.id },
                            data: { updatedAt: new Date() },
                        });
                    } catch (e) {
                        console.error("AI response error:", e);
                    }
                })();
            }

            return { message, conversationId: conversation.id };
        }),

    // Toggle reaction on a message
    toggleReaction: protectedProcedure
        .input(z.object({
            messageId: z.string(),
            emoji: z.string(),
        }))
        .mutation(async ({ ctx, input }) => {
            const { messageId, emoji } = input;
            const userId = ctx.session.user.id;

            const message = await ctx.db.message.findUnique({
                where: { id: messageId },
                select: { reactions: true },
            });

            if (!message) throw new TRPCError({ code: "NOT_FOUND" });

            const reactions = (message.reactions as Record<string, string[]> | null) ?? {};
            const userIds = reactions[emoji] ?? [];

            let newUserIds: string[];
            if (userIds.includes(userId)) {
                newUserIds = userIds.filter((id) => id !== userId);
            } else {
                newUserIds = [...userIds, userId];
            }

            if (newUserIds.length > 0) {
                reactions[emoji] = newUserIds;
            } else {
                delete reactions[emoji];
            }

            await ctx.db.message.update({
                where: { id: messageId },
                data: { reactions: reactions as Prisma.InputJsonValue },
            });

            return { success: true, reactions };
        }),

    // Mark messages as read
    markRead: protectedProcedure
        .input(z.object({
            conversationId: z.string().optional(),
            peerId: z.string().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            const userId = ctx.session.user.id;
            let conversationId = input.conversationId;

            if (!conversationId && input.peerId) {
                const conversation = await getOrCreateConversation(ctx.db, userId, input.peerId);
                conversationId = conversation.id;
            }

            if (!conversationId) {
                return { success: false };
            }

            const now = new Date();
            await ctx.db.message.updateMany({
                where: {
                    conversationId,
                    senderId: { not: userId },
                    read: false,
                },
                data: {
                    read: true,
                    readAt: now,
                },
            });

            return { success: true, readAt: now };
        }),

    // Archive conversation
    archiveConversation: protectedProcedure
        .input(z.object({
            conversationId: z.string().optional(),
            peerId: z.string().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            const userId = ctx.session.user.id;
            let conversationId = input.conversationId;

            if (!conversationId && input.peerId) {
                const conversation = await getOrCreateConversation(ctx.db, userId, input.peerId);
                conversationId = conversation.id;
            }

            if (!conversationId) {
                return { success: false };
            }

            const conversation = await ctx.db.conversation.findUnique({
                where: { id: conversationId },
                select: { settings: true },
            });

            const settings = (conversation?.settings as Record<string, Record<string, boolean>>) ?? {};
            settings[userId] = { ...settings[userId], archived: true };

            await ctx.db.conversation.update({
                where: { id: conversationId },
                data: { settings: settings as Prisma.InputJsonValue },
            });

            return { success: true };
        }),

    // Unarchive conversation
    unarchiveConversation: protectedProcedure
        .input(z.object({
            conversationId: z.string().optional(),
            peerId: z.string().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            const userId = ctx.session.user.id;
            let conversationId = input.conversationId;

            if (!conversationId && input.peerId) {
                const sortedIds = [userId, input.peerId].sort();
                const conversation = await ctx.db.conversation.findUnique({
                    where: { user1Id_user2Id: { user1Id: sortedIds[0]!, user2Id: sortedIds[1]! } },
                });
                conversationId = conversation?.id;
            }

            if (!conversationId) {
                return { success: false };
            }

            const conversation = await ctx.db.conversation.findUnique({
                where: { id: conversationId },
                select: { settings: true },
            });

            const settings = (conversation?.settings as Record<string, Record<string, boolean>>) ?? {};
            settings[userId] = { ...settings[userId], archived: false };

            await ctx.db.conversation.update({
                where: { id: conversationId },
                data: { settings: settings as Prisma.InputJsonValue },
            });

            return { success: true };
        }),

    // Pin/unpin conversation
    togglePin: protectedProcedure
        .input(z.object({
            conversationId: z.string(),
        }))
        .mutation(async ({ ctx, input }) => {
            const userId = ctx.session.user.id;

            const conversation = await ctx.db.conversation.findUnique({
                where: { id: input.conversationId },
                select: { settings: true },
            });

            if (!conversation) throw new TRPCError({ code: "NOT_FOUND" });

            const settings = (conversation.settings as Record<string, Record<string, boolean>>) ?? {};
            const currentPinned = settings[userId]?.pinned ?? false;
            settings[userId] = { ...settings[userId], pinned: !currentPinned };

            await ctx.db.conversation.update({
                where: { id: input.conversationId },
                data: { settings: settings as Prisma.InputJsonValue },
            });

            return { success: true, pinned: !currentPinned };
        }),

    // Mute/unmute conversation
    toggleMute: protectedProcedure
        .input(z.object({
            conversationId: z.string(),
        }))
        .mutation(async ({ ctx, input }) => {
            const userId = ctx.session.user.id;

            const conversation = await ctx.db.conversation.findUnique({
                where: { id: input.conversationId },
                select: { settings: true },
            });

            if (!conversation) throw new TRPCError({ code: "NOT_FOUND" });

            const settings = (conversation.settings as Record<string, Record<string, boolean>>) ?? {};
            const currentMuted = settings[userId]?.muted ?? false;
            settings[userId] = { ...settings[userId], muted: !currentMuted };

            await ctx.db.conversation.update({
                where: { id: input.conversationId },
                data: { settings: settings as Prisma.InputJsonValue },
            });

            return { success: true, muted: !currentMuted };
        }),
});
