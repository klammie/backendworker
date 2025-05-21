import { PrismaClient } from "@prisma/client";
import Redis from "ioredis";

const prisma = new PrismaClient();
const redis = new Redis({
  host: "localhost",
  port: 6379,
  maxRetriesPerRequest: null,  // ✅ Fix BullMQ Redis requirement
  enableOfflineQueue: false,   // ✅ Avoid unnecessary queued commands
});

// ✅ Define Trade Type for Stronger Type Safety
type TradeData = {
  userId: string;
  matchedCrypto: { name: string };
  result: number;
  interval: number;
};

// ✅ Fetch Account Details with Redis Caching
export const getAccountById = async (provider: string, providerAccountId: string) => {
  const cacheKey = `account:${provider}:${providerAccountId}`;
  const cachedAccount = await redis.get(cacheKey);

  if (cachedAccount) return JSON.parse(cachedAccount);

  const account = await prisma.account.findUnique({
    where: { provider_providerAccountId: { provider, providerAccountId } }, // ✅ Corrected compound query
  });

  if (account) await redis.set(cacheKey, JSON.stringify(account), "EX", 60);

  return account;
};

// ✅ Log Trade Execution in TradeLogs
export const addTradeLog = async (trade: TradeData) => {
  return prisma.tradeLogs.create({
    data: {
      userId: trade.userId, // ✅ Ensure we store user ID in TradeLogs
      crypto: trade.matchedCrypto.name,
      result: trade.result,
    },
  });
};

// ✅ Update Account Balance Correctly
export const updateTradeAccounts = async (userId: string, result: number) => {
  return prisma.user.update({
    where: { id: userId },
    data: { accBal: { increment: result } }, // ✅ Correct field from schema
  });
};

// ✅ Update Trade Statistics in InvestmentSummary
export const updateTradeStats = async (userId: string, result: number) => {
  if (result > 0) {
    return prisma.investmentSummary.update({
      where: { id: userId }, // ✅ Match InvestmentSummary schema
      data: { wins: { increment: 1 } },
    });
  } else {
    return prisma.investmentSummary.update({
      where: { id: userId },
      data: { loss: { increment: 1 } },
    });
  }
};

// ✅ Process Trade Transaction Safely
export const processTradeTransaction = async (accountId: string, tradeData: TradeData) => {
  await prisma.$transaction(async (tx) => {
    await tx.tradeLogs.create({
      data: {
        userId: tradeData.userId,
        crypto: tradeData.matchedCrypto.name,
        result: tradeData.result,
      },
    });

    await tx.user.update({
      where: { id: tradeData.userId },
      data: { accBal: { increment: tradeData.result } },
    });

    if (tradeData.result > 0) {
      await tx.investmentSummary.update({
        where: { id: tradeData.userId },
        data: { wins: { increment: 1 } },
      });
    } else {
      await tx.investmentSummary.update({
        where: { id: tradeData.userId },
        data: { loss: { increment: 1 } },
      });
    }
  });

  console.log("✅ Trade processed successfully!");
};