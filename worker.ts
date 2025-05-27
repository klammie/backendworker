import { Worker } from "bullmq";
import { redisClient } from "./redisClient"; // ✅ Use shared Redis client
import { cryptoAcc, processTrade, generateExecutionInterval } from "./tradeProcessor";

const worker = new Worker(
  "tradeQueue",
  async (job) => {
    console.log(`🔄 Processing job: ${job.id} with data: ${JSON.stringify(job.data)} at ${new Date().toISOString()}`);

    try {
      const { cryptoId, accountId } = job.data;

      // ✅ Validate crypto data exists
      if (!cryptoAcc || cryptoAcc.length === 0) {
        console.error("❌ Crypto data is missing or not loaded!");
        return;
      }

      const matchedCrypto = cryptoAcc.find((crypto) => crypto.cryptoId === String(cryptoId));

      if (!matchedCrypto) {
        console.error(`❌ No matching crypto found for ID ${cryptoId}`);
        return;
      }

      const executionInterval = generateExecutionInterval(matchedCrypto);
      console.log(`⏳ Waiting ${executionInterval / 1000} seconds before executing trade for ${job.data.name}...`);

      // ✅ Execute trade
      setTimeout(async () => {
        try {
          await processTrade(job.data);
          console.log(`✅ Trade completed for ${job.data.name} after ${executionInterval / 1000} seconds.`);
        } catch (error) {
          console.error(`❌ Error executing trade for ${job.data.name}:`, error);
        }
      }, executionInterval);
    } catch (error) {
      console.error(`❌ Error processing trade job:`, error);
    }
  },
  { connection: redisClient }
);

worker.on("failed", (job, err) => {
  console.error(`❌ Job failed: ${job?.id}`, err);
});

console.log("🚀 Worker listening for trade jobs!");