import { Request, Response, NextFunction } from "express";
import { Redis } from "ioredis";

// Initialize Redis Client
// Uses REDIS_URL from .env (e.g., redis://:password@host:port)
const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
    },
});

redis.on("error", (err) => {
    // Suppress connection errors to avoid log spam if Redis is down (fail open)
    console.warn("[REDIS] Connection Error:", err.message);
});

redis.on("connect", () => {
    console.log("[REDIS] Connected to Redis Cloud");
});

const WINDOW_SIZE_IN_SECONDS = 60;
const MAX_WINDOW_REQUESTS = 60; // 60 requests per minute

export const rateLimiterMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Use User ID if authenticated, otherwise IP
        // @ts-ignore - req.user added by auth middleware
        const key = req.user ? `rate_limit:user:${req.user.uid}` : `rate_limit:ip:${req.ip}`;

        // Simple Fixed Window Counter
        const currentCount = await redis.incr(key);

        if (currentCount === 1) {
            // Set expiration on first increment
            await redis.expire(key, WINDOW_SIZE_IN_SECONDS);
        }

        if (currentCount > MAX_WINDOW_REQUESTS) {
            res.status(429).json({
                error: "Too many requests",
                message: "You have exceeded the 60 requests in 1 minute limit!",
            });
            return;
        }

        next();
    } catch (error) {
        console.error("[RateLimiter] Redis Error:", error);
        // Fail open if Redis is down so users aren't blocked
        next();
    }
};

export { redis }; // Export for use in other files (Queue)
