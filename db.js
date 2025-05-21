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
exports.processTradeTransaction = exports.updateTradeStats = exports.updateTradeAccounts = exports.addTradeLog = exports.getAccountById = void 0;
const client_1 = require("@prisma/client");
const ioredis_1 = __importDefault(require("ioredis"));
const prisma = new client_1.PrismaClient();
const redis = new ioredis_1.default("redis://your-fly-redis-instance:6379");
// ✅ Fetch Account Details
const getAccountById = (accountId) => __awaiter(void 0, void 0, void 0, function* () {
    const cacheKey = `account:${accountId}`;
    console.time("Redis Lookup Time");
    let account = yield redis.get(cacheKey);
    console.timeEnd("Redis Lookup Time");
    if (account)
        return JSON.parse(account); // ✅ Return cached data
    console.time("DB Lookup Time");
    account = yield prisma.account.findUnique({ where: { id: accountId } });
    console.timeEnd("DB Lookup Time");
    if (account)
        yield redis.set(cacheKey, JSON.stringify(account), "EX", 60); // ✅ Cache for 60s
    return account;
});
exports.getAccountById = getAccountById;
// ✅ Add Trade Log (Atomic operation)
const addTradeLog = (trade) => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.trade.create({
        data: {
            crypto: trade.matchedCrypto.name,
            result: trade.result,
            interval: trade.interval,
        },
    });
});
exports.addTradeLog = addTradeLog;
// ✅ Update Account Balance
const updateTradeAccounts = (accountId, result) => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.account.update({
        where: { id: accountId },
        data: { amount: { increment: result } },
    });
});
exports.updateTradeAccounts = updateTradeAccounts;
// ✅ Update Trade Statistics
const updateTradeStats = (accountId, result) => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.user.update({
        where: { id: accountId },
        data: { tradeStats: { increment: result } },
    });
});
exports.updateTradeStats = updateTradeStats;
const processTradeTransaction = (accountId, tradeData) => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        yield tx.trade.create({
            data: {
                crypto: tradeData.matchedCrypto.name,
                result: tradeData.result,
                interval: tradeData.interval,
            },
        });
        yield tx.account.update({
            where: { id: accountId },
            data: { amount: { increment: tradeData.result } },
        });
        yield tx.user.update({
            where: { id: accountId }, // Ensure this references the correct user ID
            data: { tradeStats: { increment: tradeData.result } },
        });
    }));
    console.log("Trade processed successfully!");
});
exports.processTradeTransaction = processTradeTransaction;
