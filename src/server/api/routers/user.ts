
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { AI_BOT_ID } from "@/constants";

export const userRouter = createTRPCRouter({
    // Get all users for new message popup (infinite scroll)
    getAllUsers: protectedProcedure
        .input(z.object({
            limit: z.number().min(1).max(50).default(20),
            cursor: z.string().optional(),
            search: z.string().optional(),
        }))
        .query(async ({ ctx, input }) => {
            const { limit, cursor, search } = input;
            const userId = ctx.session.user.id;

            // Build where clause
            const where = {
                NOT: { id: userId },
                ...(search ? {
                    OR: [
                        { name: { contains: search, mode: "insensitive" as const } },
                        { email: { contains: search, mode: "insensitive" as const } },
                    ],
                } : {}),
            };

            const users = await ctx.db.user.findMany({
                take: limit + 1,
                where,
                cursor: cursor ? { id: cursor } : undefined,
                orderBy: [
                    { id: "asc" }, // AI bot first (starts with 'i')
                ],
                select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                    isOnline: true,
                    lastSeen: true,
                },
            });

            let nextCursor: string | undefined;
            if (users.length > limit) {
                const nextItem = users.pop();
                nextCursor = nextItem!.id;
            }

            // Sort to ensure AI bot is first
            const sortedUsers = users.sort((a, b) => {
                if (a.id === AI_BOT_ID) return -1;
                if (b.id === AI_BOT_ID) return 1;
                return a.name.localeCompare(b.name);
            });

            return {
                users: sortedUsers,
                nextCursor,
            };
        }),

    getProfile: protectedProcedure
        .query(async ({ ctx }) => {
            return ctx.db.user.findUnique({
                where: { id: ctx.session.user.id },
            });
        }),

    updateProfile: protectedProcedure
        .input(z.object({
            name: z.string().optional(),
            about: z.string().optional(),
            status: z.string().optional(),
            image: z.string().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            return ctx.db.user.update({
                where: { id: ctx.session.user.id },
                data: input,
            });
        }),
});

