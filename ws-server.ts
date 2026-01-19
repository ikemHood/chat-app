import "dotenv/config";
import { auth } from "./src/server/better-auth/config";
import { db } from "./src/server/db";
import type { WsData, WsIncomingMessage } from "./src/types/websocket";

import {
    initJwks,
    verifyJwtToken,
    registerClient,
    unregisterClient,
    handleWsMessage,
    markMessagesDelivered,
    broadcast,
} from "./server/api/wshelpers";

const hostname = "localhost";
const nextPort = parseInt(process.env.PORT ?? "3000", 10);
const wsPort = parseInt(process.env.WS_PORT ?? "3001", 10);

async function startWsServer() {
    // Initialize JWKS with the address of the Next.js server (where /api/auth/jwks lives)
    // We assume Next.js runs on 'hostname' and 'port' (3000)
    initJwks(hostname, nextPort);

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
                    try {
                        const session = await auth.api.getSession({
                            headers: req.headers,
                        });
                        userId = session?.user?.id ?? null;
                        if (userId) {
                            console.log(`[WS] Cookie auth for user: ${userId}`);
                        }
                    } catch (error) {
                        console.error("[WS] Session retrieval failed:", error);
                    }
                }

                if (!userId) {
                    console.log("[WS] Authentication failed - no valid token or session");
                    // We can return 401, but for browsers it might be better to just fail upgrade or close
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
                const isFirstConnection = registerClient(userId, ws);

                // Update user status to online in PostgreSQL
                try {
                    await db.user.update({
                        where: { id: userId },
                        data: { isOnline: true, lastSeen: new Date() },
                    });
                } catch (e) {
                    console.error(`[WS] Failed to update user online status for ${userId}:`, e);
                }

                if (isFirstConnection) {
                    broadcast({
                        type: "STATUS",
                        payload: {
                            userId,
                            isOnline: true,
                        },
                    });
                    console.log(`[WS] User ${userId} came online`);
                }

                // Mark pending messages as delivered
                await markMessagesDelivered(userId);

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
                    try {
                        await db.user.update({
                            where: { id: userId },
                            data: { isOnline: false, lastSeen: new Date() },
                        });
                    } catch (e) {
                        console.error(`[WS] Failed to update offline status for ${userId}:`, e);
                    }

                    // Broadcast offline status
                    broadcast({
                        type: "STATUS",
                        payload: {
                            userId,
                            isOnline: false,
                        },
                    });

                    console.log(`[WS] User ${userId} disconnected (last connection)`);
                }
            },
        },
    });

    console.log(`> WebSocket server running on ws://${hostname}:${wsPort}/ws`);
    console.log(`> Expecting Next.js server on http://${hostname}:${nextPort}`);
}

startWsServer().catch((err) => {
    console.error("Failed to start WebSocket server:", err);
    process.exit(1);
});
