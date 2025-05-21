
import { Queue, Worker } from "bullmq";
import Redis from "ioredis";
import dotenv from "dotenv";

// ✅ Load environment variables
dotenv.config();

// ✅ Explicitly use env variables
const redisHost = process.env.UPSTASH_REDIS_REST_URL
 const url=  `https://${redisHost}/get/test-key`;
  const token =  process.env.UPSTASH_REDIS_REST_TOKEN;
// ✅ Configure Redis connection
const redisClient = new Redis({
  host: process.env.UPSTASH_REDIS_REST_URL, 
  password: process.env.UPSTASH_REDIS_REST_TOKEN,
  tls: { rejectUnauthorized: false },
  maxRetriesPerRequest: null,
  enableOfflineQueue: false,
});

// ✅ Create a BullMQ queue
const tradeQueue = new Queue("tradeQueue", { connection: redisClient });

interface RedisResponse {
  result: string | null;
}

// 🔄 Fetch Redis data and add a job to the queue
async function fetchRedisData() {
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      throw new Error(`❌ Failed to fetch data: ${response.status} ${response.statusText}`);
    }

    // ✅ Explicitly cast the JSON response to match `RedisResponse`
    const data = (await response.json()) as RedisResponse;

    console.log("✅ Redis API Response:", data);

    if (data.result) {
      await tradeQueue.add("tradeJob", { keyData: data.result });
      console.log("🚀 Job Added Successfully!");
    } else {
      console.warn("⚠ No valid data to queue.");
    }
  } catch (error) {
    console.log(error);}
  }
fetchRedisData();


// ✅ Worker to process queued jobs
const worker = new Worker(
  "tradeQueue",
  async (job) => {
    console.log(`🔄 Processing job: ${job.id} with data: ${JSON.stringify(job.data)} at ${new Date().toISOString()}`);
  },
  {
    connection: redisClient,
  }
);

// 🔁 Run fetch and queue periodically
setInterval(fetchRedisData, 5000); // Fetch and queue every 5 seconds