import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";

// JWKS for JWT verification - cached
let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;
let jwksUrl: string | null = null;

/**
 * Initialize JWKS URL based on server configuration
 */
export function initJwks(hostname: string, port: number): void {
    jwksUrl = `http://${hostname}:${port}/api/auth/jwks`;
}

/**
 * Verify JWT token using JWKS
 * @param token - JWT token to verify
 * @returns User ID if valid, null otherwise
 */
export async function verifyJwtToken(token: string): Promise<{ userId: string } | null> {
    console.log(`[WS] Verifying JWT token (length: ${token.length})`);
    try {
        if (!jwksUrl) {
            console.error("[WS] JWKS URL not initialized");
            return null;
        }

        // Initialize JWKS if not cached
        if (!jwks) {
            console.log(`[WS] Fetching JWKS from ${jwksUrl}`);
            jwks = createRemoteJWKSet(new URL(jwksUrl));
        }

        console.log("[WS] Calling jwtVerify...");
        const { payload } = await jwtVerify(token, jwks);
        console.log("[WS] JWT payload:", JSON.stringify(payload));

        // Extract user ID from JWT payload (better-auth uses 'sub' for user ID)
        const userId = (payload as JWTPayload & { sub?: string }).sub;
        if (!userId) {
            console.error("[WS] JWT missing sub claim");
            return null;
        }

        console.log(`[WS] JWT verified successfully for user: ${userId}`);
        return { userId };
    } catch (error) {
        console.error("[WS] JWT verification failed:", error);
        // Reset JWKS cache on error (key might have rotated)
        jwks = null;
        return null;
    }
}

/**
 * Reset JWKS cache (useful for key rotation)
 */
export function resetJwksCache(): void {
    jwks = null;
}
