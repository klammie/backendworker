import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

export const redisClient = new Redis({
  host: process.env.UPSTASH_REDIS_REST_URL, // ✅ Matches the correct env variable
  password: process.env.UPSTASH_REDIS_REST_TOKEN, // ✅ Uses the correct token name
  tls: { rejectUnauthorized: false }, // ✅ Required for Upstash SSL
  maxRetriesPerRequest: null, 
  enableOfflineQueue: false,
});

redisClient.on("connect", () => console.log("✅ Connected to Upstash Redis!"));
redisClient.on("error", (err) => console.error("❌ Redis Error:", err));