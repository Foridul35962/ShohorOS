import { Redis } from "ioredis";
import dotenv from "dotenv";
dotenv.config();

const redisUrl: string = process.env.REDIS_URL || "redis://localhost:6379";
const prefix: string = process.env.REDIS_PREFIX || "shohorOS";

if (!redisUrl) {
  console.warn("⚠️ REDIS_URL is not set");
}

const redis = new Redis(redisUrl, {
  keyPrefix: `${prefix}:`,
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: true,

  tls: redisUrl?.startsWith("rediss://") ? {} : undefined,

  retryStrategy(times: number): number | null {
    if (times > 5) return null;

    return Math.min(times * 1000, 5000);
  },
});

redis.on("connect", () => {
  console.log("✅ [shohorOS] Redis connected");
});

redis.on("ready", () => {
  console.log("🚀 [shohorOS] Redis ready at http://localhost:5540");
});

redis.on("error", (err: Error) => {
  console.error("❌ [shohorOS] Redis error:", err);
});

redis.on("close", () => {
  console.warn("⚠️ [shohorOS] Redis connection closed");
});

export const connectRedisDB = async (): Promise<void> => {
  try {
    await redis.connect();
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("Redis connection failed:", err.message);
    } else {
      console.error("Redis connection failed:", err);
    }
  }
};

export default redis;
