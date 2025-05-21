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
Object.defineProperty(exports, "__esModule", { value: true });
const bullmq_1 = require("bullmq");
const tradeProcessor_1 = require("./tradeProcessor");
const redisClient_1 = require("./redisClient"); // ✅ Use centralized Redis client
// ✅ Proper Queue Initialization
const worker = new bullmq_1.Worker("trade-queue", (job) => __awaiter(void 0, void 0, void 0, function* () {
    const { accountId, interval } = job.data;
    if (!accountId || !interval) {
        console.error("Invalid job data: Missing account or interval.");
        return;
    }
    console.log(`Waiting ${interval}ms before processing trade for account ${accountId}...`);
    // ✅ Delay execution based on interval
    setInterval(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, tradeProcessor_1.processTrade)(accountId); // ✅ Runs after calculated delay
    }), interval);
}), { connection: redisClient_1.redisClient });
// ✅ Enhanced Event Handlers
worker.on("completed", (job) => {
    console.log(`Trade job ${job.id} completed successfully`);
});
worker.on("failed", (job, err) => {
    console.error(`Trade job ${job === null || job === void 0 ? void 0 : job.id} failed with error:`, err);
    console.error(`Job Data:`, job === null || job === void 0 ? void 0 : job.data);
});
// ✅ Graceful Shutdown Handling for Worker and Redis
process.on("SIGINT", () => __awaiter(void 0, void 0, void 0, function* () {
    yield redisClient_1.redisClient.quit();
    console.log("Redis connection closed.");
    process.exit(0);
}));
