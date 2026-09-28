import Redis from "ioredis";
import dotenv from 'dotenv'
dotenv.config()

const redisUrl = process.env.REDIS_URL;
const prefix = process.env.REDIS_PREFIX || "shohorOS";

if (!redisUrl) {
  console.warn("⚠️ REDIS_URL is not set");
}

const redis = new Redis(redisUrl, {
  keyPrefix: `${prefix}:`,
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: true,
  tls: process.env.REDIS_URL?.startsWith("rediss://") ? {} : undefined,
  retryStrategy(times) {
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

redis.on("error", (err) => {
  console.error("❌ [shohorOS] Redis error:", err);
});

redis.on("close", () => {
  console.warn("⚠️ [shohorOS] Redis connection closed");
});


export const connectRedisDB = async () => {
  try {
    await redis.connect();
  } catch (err) {
    console.error("Redis connection failed:", err.message);
  }
};

export default redis;