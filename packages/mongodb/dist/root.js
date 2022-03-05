"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.root = void 0;
const common_1 = require("@klonzo/common");
const mongodb = __importStar(require("mongodb"));
const getEmail_1 = require("./getEmail");
const importPST_1 = require("./importPST");
const searchHistory_1 = require("./searchHistory");
const getWordCloud = async () => {
    try {
        const client = await mongodb.MongoClient.connect(process.env.MONGODB_HOST);
        const db = client.db(common_1.dbName);
        const wordCloud = await db.collection(common_1.wordCloudCollection).find().toArray();
        return wordCloud.map((word) => ({ tag: word.tag, weight: word.weight }));
    }
    catch (err) {
        console.error(err.stack);
    }
};
const getEmailSentByDay = async () => {
    try {
        const client = await mongodb.MongoClient.connect(process.env.MONGODB_HOST);
        const db = client.db(common_1.dbName);
        const emailSentByDay = await db
            .collection(common_1.emailSentByDayCollection)
            .find()
            .sort({ sent: 1 })
            .toArray();
        return emailSentByDay.map((day) => ({ sent: day.sent, total: day.total }));
    }
    catch (err) {
        console.error(err.stack);
    }
};
const getCustodians = async () => {
    try {
        const client = await mongodb.MongoClient.connect(process.env.MONGODB_HOST);
        const db = client.db(common_1.dbName);
        const custodians = await db.collection(common_1.custodianCollection).find().toArray();
        return custodians.map((custodian) => ({
            id: custodian.id,
            name: custodian.name,
            title: custodian.title,
            color: custodian.color,
            senderTotal: custodian.senderTotal,
            receiverTotal: custodian.receiverTotal,
            toCustodians: custodian.toCustodians,
        }));
    }
    catch (err) {
        console.error(err.stack);
    }
};
const setCustodianColor = async (httpQuery) => {
    try {
        const client = await mongodb.MongoClient.connect(process.env.MONGODB_HOST);
        const db = client.db(common_1.dbName);
        await db
            .collection(common_1.custodianCollection)
            .findOneAndUpdate({ id: httpQuery.id }, { $set: { color: httpQuery.color } });
        const custodians = await db.collection(common_1.custodianCollection).find().toArray();
        return custodians.map((custodian) => ({
            id: custodian.id,
            name: custodian.name,
            title: custodian.title,
            color: custodian.color,
            senderTotal: custodian.senderTotal,
            receiverTotal: custodian.receiverTotal,
            toCustodians: custodian.toCustodians,
        }));
    }
    catch (err) {
        console.error(err.stack);
    }
};
exports.root = {
    clearSearchHistory: () => (0, searchHistory_1.clearSearchHistory)(),
    getCustodians: () => getCustodians(),
    getEmail: (httpQuery) => (0, getEmail_1.getEmail)(httpQuery),
    getEmailSentByDay: () => getEmailSentByDay(),
    getImportStatus: () => (0, importPST_1.getImportStatus)(),
    getSearchHistory: () => (0, searchHistory_1.getSearchHistory)(),
    getWordCloud: () => getWordCloud(),
    importPST: (httpQuery) => (0, importPST_1.importPST)(httpQuery),
    setCustodianColor: (httpQuery) => setCustodianColor(httpQuery),
};
exports.default = exports.root;
//# sourceMappingURL=root.js.map