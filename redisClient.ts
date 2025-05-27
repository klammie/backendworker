import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config(); // ✅ Ensure environment variables are loaded

// ✅ Always use the full Redis URL from Fly.io secrets
const redisUrl = process.env.NODE_ENV === "prod"
  ? process.env.REDIS_URL
  : "localhost";

if (!redisUrl) {
  throw new Error("❌ REDIS_URL is missing—cannot connect to Redis!");
}

export const redisClient = new Redis(redisUrl, {
  tls: { rejectUnauthorized: false }, // ✅ Required for Upstash Redis
  maxRetriesPerRequest: null,
  enableOfflineQueue: false,
});

redisClient.on("connect", () => console.log("✅ Connected to Redis!"));
redisClient.on("error", (err) => console.error("❌ Redis Error:", err));