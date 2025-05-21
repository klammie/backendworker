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
exports.processTrade = exports.updateTradeStatsLc = exports.generateExecutionInterval = exports.generateTradeResult = void 0;
const db_1 = require("./db");
// ✅ Centralized Crypto Data
const cryptoData = [
    { name: "Bitcoin", image: "/crypto-images/bitcoin1.png", id: 1 },
    { name: "Litecoin", image: "/crypto-images/coin.png", id: 2 },
    { name: "Dogecoin", image: "/crypto-images/dogecoin.png", id: 3 },
    { name: "Ethereum", image: "/crypto-images/ethereum.png", id: 4 },
    { name: "Gold", image: "/crypto-images/gold-bars.png", id: 5 },
    { name: "Pepecoin", image: "/crypto-images/pepelogo.png", id: 6 },
    { name: "Solana", image: "/crypto-images/solanac.png", id: 7 },
    { name: "Xrp", image: "/crypto-images/xrp.png", id: 8 },
    { name: "Tether", image: "/crypto-images/tether.png", id: 9 },
];
// ✅ Match Crypto by ID
const getCryptoById = (cryptoId) => {
    return cryptoData.find((crypto) => crypto.id === cryptoId);
};
// ✅ Generate Trade Result Using Special Key
const generateTradeResult = (account) => {
    const isProfit = Math.random() < 0.5;
    const variation = Math.random() * account.specialKey.min + account.specialKey.max;
    const formattedVariation = Number(variation.toFixed(2));
    return isProfit ? formattedVariation : -formattedVariation;
};
exports.generateTradeResult = generateTradeResult;
// ✅ Generate Execution Interval Based on Wait Time
const generateExecutionInterval = (account) => {
    const minInterval = account.waitTime.min * 1000;
    const maxInterval = account.waitTime.max * 1000;
    return Math.random() * (maxInterval - minInterval) + minInterval;
};
exports.generateExecutionInterval = generateExecutionInterval;
// ✅ Update Trade Statistics in Database
const updateTradeStatsLc = (accountId, result) => __awaiter(void 0, void 0, void 0, function* () {
    if (!accountId) {
        console.error("Account ID is missing");
        return;
    }
    yield (0, db_1.updateTradeStats)(accountId, result);
});
exports.updateTradeStatsLc = updateTradeStatsLc;
// ✅ Core Trade Processing Function
const processTrade = (account) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Trade Initiated:", account);
    if (!account.cryptoId) {
        console.error("Crypto ID is missing from the account.");
        return;
    }
    const matchedCrypto = getCryptoById(account.cryptoId);
    if (!matchedCrypto) {
        console.error("Invalid Crypto ID provided.");
        return;
    }
    const result = (0, exports.generateTradeResult)(account);
    const interval = (0, exports.generateExecutionInterval)(account);
    console.log(`Executing trade with ${matchedCrypto.name} | Interval: ${interval}ms`);
    // ✅ Store trade log in database
    yield (0, db_1.addTradeLog)({ matchedCrypto, result, interval });
    // ✅ Update account balance based on trade result
    yield (0, db_1.updateTradeAccounts)(account.id, result);
    // ✅ Update trade statistics
    yield (0, exports.updateTradeStatsLc)(account.id, result);
    console.log("Trade log recorded, account balance updated!");
});
exports.processTrade = processTrade;
