import "dotenv/config";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import next from "next";
import type { ServerWebSocket } from "bun";
import { auth } from "./src/server/better-auth/config";
import { db } from "./src/server/db";
import { pubsub, publishStatus } from "./src/server/pubsub";
import type { WsData, WsIncomingMessage } from "./src/types/websocket";

// Import modularized helpers
import {
    initJwks,
    verifyJwtToken,
    registerClient,
    unregisterClient,
    setupPubSubHandlers,
    handleWsMessage,
    markMessagesDelivered,
} from "./server/api/wshelpers";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT ?? "3000", 10);
const wsPort = parseInt(process.env.WS_PORT ?? "3001", 10);

// Initialize Next.js
const app = next({ dev, hostname, port });
const nextHandler = app.getRequestHandler();

async function startServer(): Promise<void> {
    await app.prepare();
    await pubsub.connect();

    await db.user.updateMany({
        where: { isOnline: true },
        data: { isOnline: false },
    });
    console.log("> Reset all users to offline status");

    // Initialize JWKS for JWT verification
    initJwks(hostname, port);

    // Setup PubSub handlers
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
                // Get JWT token from query parameter
                const token = url.searchParams.get("token");

                let userId: string | null = null;

                if (token) {
                    // Verify JWT token using JWKS
                    const verified = await verifyJwtToken(token);
                    if (verified) {
                        userId = verified.userId;
                        console.log(`[WS] JWT verified for user: ${userId}`);
                    }
                }

                // Fallback to cookie-based auth (same-origin connections)
                if (!userId) {
                    const session = await auth.api.getSession({
                        headers: req.headers,
                    });
                    userId = session?.user?.id ?? null;
                    if (userId) {
                        console.log(`[WS] Cookie auth for user: ${userId}`);
                    }
                }

                if (!userId) {
                    console.log("[WS] Authentication failed - no valid token or session");
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

                // Register connection using modular helper
                registerClient(userId, ws);

                // Update user status to online in PostgreSQL
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

                    // Handle message using modular helper
                    await handleWsMessage(userId, data);
                } catch (e) {
                    console.error("[WS] Message error:", e);
                }
            },

            async close(ws) {
                const userId = ws.data.userId;

                // Unregister using modular helper - returns true if last connection
                const wasLastConnection = unregisterClient(userId, ws);

                if (wasLastConnection) {
                    // Update user status in PostgreSQL
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
