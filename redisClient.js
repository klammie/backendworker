"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisClient = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.redisClient = new ioredis_1.default({
    host: process.env.UPSTASH_REDIS_HOST,
    port: Number(process.env.UPSTASH_REDIS_PORT),
    password: process.env.UPSTASH_REDIS_PASSWORD,
    tls: {}, // Enables SSL/TLS
});
exports.redisClient.on("connect", () => console.log("Connected to Upstash Redis!"));
exports.redisClient.on("error", (err) => console.error("Redis Error:", err));
