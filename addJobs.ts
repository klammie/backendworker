import { Queue } from "bullmq";
import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

// ✅ Configure Redis connection
const redisClient = new Redis({
  host: process.env.UPSTASH_REDIS_REST_URL,
  password: process.env.UPSTASH_REDIS_REST_TOKEN,
  tls: { rejectUnauthorized: false },
  maxRetriesPerRequest: null,
  enableOfflineQueue: false,
});

// ✅ Create BullMQ queue
const tradeQueue = new Queue("tradeQueue", { connection: redisClient });

// ✅ User data array
const userInfo = [
  { name: "John", cryptoId: "20000L", accountId: "cm8or8i4w0000uoselr3m3r9h", id: 1 },
  { name: "Emma", cryptoId: "200000L", accountId: "cm9h98xj400004xy04fwq7pvl", id: 2 },
  { name: "Liam", cryptoId: "3000L", accountId: "cm8or8i4w0000uoselr3m3r9h", id: 3 },
  { name: "Olivia", cryptoId: "50000L", accountId: "cm9h98xj400004xy04fwq7pvl", id: 4 },
  { name: "Noah", cryptoId: "10000L", accountId: "cm8or8i4w0000uoselr3m3r9h", id: 5 },
];

// ✅ Function to randomly select a user and add them to BullMQ
async function addRandomUserJob() {
  const randomIndex = Math.floor(Math.random() * userInfo.length);
  const selectedUser = userInfo[randomIndex];

  try {
    await tradeQueue.add("tradeJob", selectedUser);
    console.log(`🚀 Job added successfully for ${selectedUser.name} with Crypto ID: ${selectedUser.cryptoId}`);
  } catch (error) {
    console.error("❌ Error adding job:", error);
  }
}

// ✅ Run function to add a job
addRandomUserJob();