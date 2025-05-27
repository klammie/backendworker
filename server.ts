import dotenv from "dotenv";
dotenv.config(); // ✅ Load environment variables before anything else

import express from "express";
import cors from "cors";
import { Queue } from "bullmq";
import { getAccountById } from "./db";
import { redisClient } from "./redisClient"; // ✅ Use central Redis client
import { Request, Response } from "express";
import { CryptoAccount, generateExecutionInterval } from "./tradeProcessor";

const app = express();
app.use(cors());
app.use(express.json());
const PORT = Number(process.env.PORT) || 8080;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// ✅ Use Redis client for BullMQ
const tradeQueue = new Queue("trade-queue", { connection: redisClient });




// ✅ API to Trigger a Trade Job

app.post("/trade", async (req: Request, res: Response): Promise<void> => {
  try {
  const { accountId, provider, providerAccountId } = req.body;

if (!accountId || !provider || !providerAccountId) {
  res.status(400).json({ error: "Account ID, Provider, and Provider Account ID required" });
  return;
}

    console.log(`Checking Redis for account: account:${accountId}`);
    const cachedAccount = await redisClient.get(`account:${accountId}`);
    const account: CryptoAccount = cachedAccount ? JSON.parse(cachedAccount) : await getAccountById(accountId.provider, accountId.providerAccountId);

    if (!account) {
      res.status(404).json({ error: "Account not found" });
      return;
    }

    const executionInterval = generateExecutionInterval(account); // ✅ Pass the full account object

    // ✅ Enqueue job in BullMQ with the correct interval
    await tradeQueue.add("process-trade", { account, interval: executionInterval });

    console.log("Final Account Data:", account);
    res.json({ message: "Trade request received and queued", account });
  } catch (error) {
    console.error("Trade request error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
// ✅ Health Check for Fly.io
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

app.get("/home", (req, res) => {
  res.status(200).send("Welcome to Corefunction API");
});

// ✅ Graceful shutdown handling
process.on("SIGINT", async () => {
  await redisClient.quit();
  console.log("Redis connection closed.");
  process.exit(0);
});
