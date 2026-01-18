import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

import { env } from "@/env";
import { db } from "@/server/db";

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  // Only include GitHub provider if credentials are configured
  socialProviders: {
    github: env.BETTER_AUTH_GITHUB_CLIENT_ID && env.BETTER_AUTH_GITHUB_CLIENT_SECRET
      ? {
        clientId: env.BETTER_AUTH_GITHUB_CLIENT_ID,
        clientSecret: env.BETTER_AUTH_GITHUB_CLIENT_SECRET,
      }
      : undefined,
    google: env.BETTER_AUTH_GOOGLE_CLIENT_ID && env.BETTER_AUTH_GOOGLE_CLIENT_SECRET
      ? {
        clientId: env.BETTER_AUTH_GOOGLE_CLIENT_ID,
        clientSecret: env.BETTER_AUTH_GOOGLE_CLIENT_SECRET,
      }
      : undefined,
  },
  // Assign random avatar on user creation
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          // Only set avatar if user doesn't have one (e.g., from OAuth)
          if (!user.image) {
            // Use user ID hash for consistent but unique avatar
            const seed = user.id.slice(-6);
            await db.user.update({
              where: { id: user.id },
              data: {
                image: `https://picsum.photos/seed/${seed}/200`,
              },
            });
          }
        },
      },
    },
  },
});

export type Session = typeof auth.$Infer.Session;
