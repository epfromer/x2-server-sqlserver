"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.root = void 0;
const common_1 = require("@klonzo/common");
const redis_1 = __importDefault(require("redis"));
const util_1 = require("util");
const getEmail_1 = require("./getEmail");
const importPST_1 = require("./importPST");
const searchHistory_1 = require("./searchHistory");
// https://oss.redislabs.com/redisearch/Commands.html#ftget
const client = redis_1.default.createClient();
const ftGetAsync = (0, util_1.promisify)(client.ft_get).bind(client);
const ftAddAsync = (0, util_1.promisify)(client.ft_add).bind(client);
const getWordCloud = async () => {
    try {
        const docArr = await ftGetAsync([common_1.dbName + common_1.wordCloudCollection, 'wordcloud']);
        return JSON.parse(docArr[1]);
    }
    catch (err) {
        console.error(err.stack);
    }
};
const getEmailSentByDay = async () => {
    try {
        const docArr = await ftGetAsync([
            common_1.dbName + common_1.emailSentByDayCollection,
            'emailSentByDay',
        ]);
        return JSON.parse(docArr[1]);
    }
    catch (err) {
        console.error(err.stack);
    }
};
const getCustodians = async () => {
    try {
        const docArr = await ftGetAsync([
            common_1.dbName + common_1.custodianCollection,
            'custodians',
        ]);
        return JSON.parse(docArr[1]);
    }
    catch (err) {
        console.error(err.stack);
    }
};
const setCustodianColor = async (httpQuery) => {
    let docArr = await ftGetAsync([common_1.dbName + common_1.custodianCollection, 'custodians']);
    const custodians = JSON.parse(docArr[1]).map((custodian) => {
        if (custodian.id === httpQuery.id)
            custodian.color = httpQuery.color;
        return custodian;
    });
    await ftAddAsync([
        common_1.dbName + common_1.custodianCollection,
        'custodians',
        1.0,
        'REPLACE',
        'FIELDS',
        'custodians',
        JSON.stringify(custodians),
    ]);
    docArr = await ftGetAsync([common_1.dbName + common_1.custodianCollection, 'custodians']);
    return JSON.parse(docArr[1]);
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