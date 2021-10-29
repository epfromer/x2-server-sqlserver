"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearSearchHistory = exports.getSearchHistory = void 0;
const common_1 = require("@klonzo/common");
const elasticsearch_1 = require("@elastic/elasticsearch");
async function getSearchHistory() {
    try {
        const client = new elasticsearch_1.Client({
            node: `http://${process.env.ELASTIC_HOST}:${process.env.ELASTIC_PORT}`,
        });
        const { body } = await client.search({
            index: common_1.dbName + common_1.searchHistoryCollection,
            q: '*',
            sort: 'timestamp:desc',
        });
        return body.hits.hits.map((entry) => ({
            id: entry._id,
            timestamp: entry._source.timestamp,
            entry: entry._source.entry,
        }));
    }
    catch (err) {
        console.error(err.stack);
    }
}
exports.getSearchHistory = getSearchHistory;
async function clearSearchHistory() {
    try {
        const client = new elasticsearch_1.Client({
            node: `http://${process.env.ELASTIC_HOST}:${process.env.ELASTIC_PORT}`,
        });
        await client.indices.delete({ index: common_1.dbName + common_1.searchHistoryCollection });
        await client.indices.create({ index: common_1.dbName + common_1.searchHistoryCollection });
        return `Search history cleared`;
    }
    catch (err) {
        console.error(err.stack);
    }
}
exports.clearSearchHistory = clearSearchHistory;
//# sourceMappingURL=searchHistory.js.map