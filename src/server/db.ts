import { env } from "@/env";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../../generated/prisma";

const connectionString = `${env.DATABASE_URL}`;
const adapter = new PrismaNeon({ connectionString });

const createPrismaClient = () =>
  new PrismaClient({
    adapter,
    log: ["error"],
    // env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (env.NODE_ENV !== "production") globalForPrisma.prisma = db;
