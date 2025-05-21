"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisClient = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.redisClient = new ioredis_1.default({
    host: process.env.UPSTASH_REDIS_HOST || "localhost",
    port: Number(process.env.UPSTASH_REDIS_PORT) || 6379,
    password: process.env.UPSTASH_REDIS_PASSWORD || undefined,
    tls: ((_a = process.env.UPSTASH_REDIS_HOST) === null || _a === void 0 ? void 0 : _a.includes("upstash.io")) ? { rejectUnauthorized: false } : undefined,
    maxRetriesPerRequest: null, // ✅ Required for BullMQ to work properly
    enableOfflineQueue: false, // ✅ Ensures stability during network failures
});
exports.redisClient.on("connect", () => console.log("Connected to Redis!"));
exports.redisClient.on("error", (err) => console.error("Redis Error:", err));
