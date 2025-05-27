import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  throw new Error("❌ REDIS_URL is missing—cannot connect to Redis!");
}

export const redisClient = new Redis(redisUrl, {
  tls: { rejectUnauthorized: false }, // Required for Upstash
  maxRetriesPerRequest: null,
  enableOfflineQueue: false,
});

redisClient.on("connect", () => console.log("✅ Connected to Upstash Redis!"));
redisClient.on("error", (err) => console.error("❌ Redis Error:", err));