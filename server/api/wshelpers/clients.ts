import type { ServerWebSocket } from "bun";
import type { WsData, WsOutgoingMessage } from "../../../src/types/websocket";

// Map userId -> Set<WebSocket>
const clients = new Map<string, Set<ServerWebSocket<WsData>>>();

/**
 * Register a client connection
 */
export function registerClient(userId: string, ws: ServerWebSocket<WsData>): void {
    if (!clients.has(userId)) {
        clients.set(userId, new Set());
    }
    clients.get(userId)!.add(ws);
}

/**
 * Unregister a client connection
 * @returns true if this was the user's last connection
 */
export function unregisterClient(userId: string, ws: ServerWebSocket<WsData>): boolean {
    const userSockets = clients.get(userId);
    if (userSockets) {
        userSockets.delete(ws);
        if (userSockets.size === 0) {
            clients.delete(userId);
            return true; // Last connection for this user
        }
    }
    return false;
}

/**
 * Check if a user is currently connected
 */
export function isUserConnected(userId: string): boolean {
    return clients.has(userId);
}

/**
 * Send message to a specific user (all their connected tabs)
 */
export function sendToUser(userId: string, data: WsOutgoingMessage): void {
    const sockets = clients.get(userId);
    if (sockets) {
        const msg = JSON.stringify(data);
        for (const ws of sockets) {
            ws.send(msg);
        }
    }
}

/**
 * Broadcast to all connected clients
 */
export function broadcast(data: WsOutgoingMessage): void {
    const msg = JSON.stringify(data);
    for (const userSockets of clients.values()) {
        for (const ws of userSockets) {
            ws.send(msg);
        }
    }
}

/**
 * Get the number of connected users
 */
export function getConnectedUserCount(): number {
    return clients.size;
}

/**
 * Get all connected user IDs
 */
export function getConnectedUserIds(): string[] {
    return Array.from(clients.keys());
}
