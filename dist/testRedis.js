"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ioredis_1 = __importDefault(require("ioredis"));
const redis = new ioredis_1.default("rediss://default:AYgrAAIjcDFlZmRmMzRjMjZjMTM0Mzk4YmUzNTZmOGUzM2NhODczMXAxMA@able-mastodon-34859.upstash.io:6379");
redis.ping()
    .then((res) => console.log("Redis Connection:", res))
    .catch((err) => console.error("Redis Error:", err));
