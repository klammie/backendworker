"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bullmq_1 = require("bullmq");
const db_1 = require("./db");
const redisClient_1 = require("./redisClient"); // ✅ Use central Redis client
const tradeProcessor_1 = require("./tradeProcessor");
const app = (0, express_1.default)();
const port = 3000;
// ✅ Use Redis client for BullMQ
const tradeQueue = new bullmq_1.Queue("trade-queue", { connection: redisClient_1.redisClient });
app.use(express_1.default.json());
// ✅ API to Trigger a Trade Job
app.post("/trade", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { accountId } = req.body;
        if (!accountId) {
            res.status(400).json({ error: "Account ID required" });
            return;
        }
        console.log(`Checking Redis for account: account:${accountId}`);
        const cachedAccount = yield redisClient_1.redisClient.get(`account:${accountId}`);
        const account = cachedAccount ? JSON.parse(cachedAccount) : yield (0, db_1.getAccountById)(accountId);
        if (!account) {
            res.status(404).json({ error: "Account not found" });
            return;
        }
        const executionInterval = (0, tradeProcessor_1.generateExecutionInterval)(account); // ✅ Pass the full account object
        // ✅ Enqueue job in BullMQ with the correct interval
        yield tradeQueue.add("process-trade", { account, interval: executionInterval });
        console.log("Final Account Data:", account);
        res.json({ message: "Trade request received and queued", account });
    }
    catch (error) {
        console.error("Trade request error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}));
// ✅ Health Check for Fly.io
app.get("/health", (req, res) => {
    res.status(200).send("OK");
});
// ✅ Graceful shutdown handling
process.on("SIGINT", () => __awaiter(void 0, void 0, void 0, function* () {
    yield redisClient_1.redisClient.quit();
    console.log("Redis connection closed.");
    process.exit(0);
}));
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
