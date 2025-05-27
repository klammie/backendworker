import { Queue } from "bullmq";
import dotenv from "dotenv";
import { redisClient } from "./redisClient"; // ✅ Import centralized Redis client

dotenv.config();

// ✅ Use Upstash Redis connection string instead of REST API
const tradeQueue = new Queue("tradeQueue", { connection: redisClient });

async function addJobFromRedis() {
  try {
    const userData = await redisClient.get("user-data"); // ✅ Direct Redis call instead of REST
    if (!userData) {
      console.warn("⚠ No valid data fetched from Redis");
      return;
    }

    // ✅ Ensure userData is properly parsed if stored as JSON string
    const parsedData = typeof userData === "string" ? JSON.parse(userData) : userData;

    await tradeQueue.add("tradeJob", parsedData);
    console.log(`🚀 Job added successfully for ${parsedData.name} with Crypto ID: ${parsedData.cryptoId}`);
  } catch (error) {
    console.error("❌ Error adding job from Redis:", error);
  }
}

// ✅ Run function to fetch and add job
addJobFromRedis();