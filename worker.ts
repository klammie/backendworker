import { Worker } from "bullmq";
import { cryptoAcc, processTrade } from "./tradeProcessor";
import { generateExecutionInterval } from "./tradeProcessor"; // ✅ Ensure correct import
import Redis from "ioredis";

const redisClient = new Redis({
  host: process.env.UPSTASH_REDIS_REST_URL,
  password: process.env.UPSTASH_REDIS_REST_TOKEN,
  tls: { rejectUnauthorized: false },
  maxRetriesPerRequest: null,
  enableOfflineQueue: false,
});


// ✅ Worker to process queued jobs with interval-based execution
const worker = new Worker("tradeQueue", async (job) => {
  console.log(`🔄 Processing job: ${job.id} with data: ${JSON.stringify(job.data)} at ${new Date().toISOString()}`);

  try {
    const { cryptoId, accountId } = job.data;

    // ✅ Find the matching crypto object
   const matchedCrypto = cryptoAcc.find((crypto) => crypto.cryptoId === String(job.data.cryptoId));

    if (!matchedCrypto) {
      console.error(`❌ No matching crypto found for ID ${cryptoId}`);
      return;
    }

    // ✅ Generate execution interval based on matched crypto data
    const executionInterval = generateExecutionInterval(matchedCrypto);
    console.log(`⏳ Waiting ${executionInterval / 1000} seconds before executing trade for ${job.data.name}...`);

    // ✅ Delay execution based on interval
  setTimeout(async () => {
  try {
    await processTrade(job.data);
    console.log(`✅ Trade completed for ${job.data.name} after ${executionInterval / 1000} seconds.`);
  } catch (error) {
    console.error(`❌ Error executing trade for ${job.data.name}:`, error);
  }
}, executionInterval);

  } catch (error) {
    console.error(`❌ Error processing trade: ${error}`);
  }
}, {
  connection: redisClient,
});

console.log("🚀 Worker listening for trade jobs!");