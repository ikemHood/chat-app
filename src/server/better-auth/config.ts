import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { jwt } from "better-auth/plugins";

import { env } from "@/env";
import { db } from "@/server/db";

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    jwt(),
  ],
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
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          if (!user.image) {
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

  advanced: {
    cookiePrefix: 'chatapp',
  },
});

export type Session = typeof auth.$Infer.Session;
