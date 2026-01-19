

import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../generated/prisma";

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
    const aiBot = await prisma.user.upsert({
        where: { email: "ai@ikem.dev" },
        update: {},
        create: {
            id: "ikem-ai-bot",
            email: "ai@ikem.dev",
            name: "Ikem Ai",
            isOnline: true,
            image: "https://picsum.photos/200",
            about: "I am an AI assistant.",
            emailVerified: true,
        },
    });
    console.log("Seeded AI User:", aiBot);
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
