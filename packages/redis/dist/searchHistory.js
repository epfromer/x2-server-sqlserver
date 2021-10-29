"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearSearchHistory = exports.getSearchHistory = void 0;
const common_1 = require("@klonzo/common");
const redis_1 = __importDefault(require("redis"));
const util_1 = require("util");
const client = redis_1.default.createClient();
const ftCreateAsync = (0, util_1.promisify)(client.ft_create).bind(client);
const ftDropAsync = (0, util_1.promisify)(client.ft_drop).bind(client);
const ftSearchAsync = (0, util_1.promisify)(client.ft_search).bind(client);
async function getSearchHistory() {
    try {
        const historyArr = await ftSearchAsync([
            common_1.dbName + common_1.searchHistoryCollection,
            ` @type:${common_1.searchHistoryCollection} `,
            'SORTBY',
            'timestamp',
            'desc',
        ]);
        const entries = [];
        // Redis response is array of name followed by value, so need to do some funky
        // assignments to get it into Object
        let i = 1;
        while (i < historyArr.length) {
            const id = historyArr[i];
            const docArr = historyArr[i + 1];
            i = i + 2;
            // 'document' is returned as array of name followed by value entries
            // and they can be in any order, so need to convert to Object
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const doc = {};
            if (!docArr)
                console.log(id, docArr);
            for (let j = 0; j < docArr.length; j = j + 2) {
                doc[docArr[j]] = docArr[j + 1];
            }
            entries.push({
                id,
                timestamp: doc.timestamp,
                entry: doc.entry,
            });
        }
        return entries;
    }
    catch (err) {
        console.error(err.stack);
    }
}
exports.getSearchHistory = getSearchHistory;
async function clearSearchHistory() {
    try {
        await ftDropAsync([common_1.dbName + common_1.searchHistoryCollection]);
        await ftCreateAsync([
            common_1.dbName + common_1.searchHistoryCollection,
            'SCHEMA',
            'timestamp',
            'TEXT',
            'SORTABLE',
            'entry',
            'TEXT',
        ]);
        return `Search history cleared`;
    }
    catch (err) {
        console.error(err.stack);
    }
}
exports.clearSearchHistory = clearSearchHistory;
//# sourceMappingURL=searchHistory.js.map