import { Queue } from "bullmq";
import Redis from "ioredis";
import dotenv from "dotenv";
dotenv.config();

const redisHost = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;
const url = `https://${redisHost}/get/user-data`; // ✅ Ensure correct key


const redisClient = new Redis({
  host: process.env.UPSTASH_REDIS_REST_URL,
  password: process.env.UPSTASH_REDIS_REST_TOKEN,
  tls: { rejectUnauthorized: false },
  maxRetriesPerRequest: null,
  enableOfflineQueue: false,
});

const tradeQueue = new Queue("tradeQueue", { connection: redisClient });

async function fetchRedisData() {
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      throw new Error(`❌ Failed to fetch data: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log("✅ Redis API Response:", data);

    return data.result; // ✅ Extract stored JSON value
  } catch (error) {
    console.error("❌ Error fetching Redis data:", error);
    return null;
  }
}

async function addJobFromRedis() {
  const userData = await fetchRedisData();
  if (!userData) {
    console.warn("⚠ No valid data fetched from Redis");
    return;
  }

  // ✅ Ensure `userData` is properly parsed if stored as a JSON string
  const parsedData = typeof userData === "string" ? JSON.parse(userData) : userData;

  await tradeQueue.add("tradeJob", parsedData);
  console.log(`🚀 Job added successfully for ${parsedData.name} with Crypto ID: ${parsedData.cryptoId}`);
}

// ✅ Run function to fetch and add job
addJobFromRedis();



