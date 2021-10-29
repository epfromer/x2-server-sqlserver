"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearSearchHistory = exports.getSearchHistory = void 0;
const common_1 = require("@klonzo/common");
const pg_1 = require("pg");
async function getSearchHistory() {
    try {
        const pool = new pg_1.Pool({ database: common_1.dbName });
        const result = await pool.query(`select * from ${common_1.searchHistoryCollection} order by time_stamp desc`);
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return result.rows.map((entry) => ({
            id: entry.history_id,
            timestamp: entry.time_stamp,
            entry: entry.entry,
        }));
    }
    catch (err) {
        console.error(err.stack);
    }
}
exports.getSearchHistory = getSearchHistory;
async function clearSearchHistory() {
    try {
        const pool = new pg_1.Pool({ database: common_1.dbName });
        await pool.query(`truncate table ${common_1.searchHistoryCollection}`);
        return `Search history cleared`;
    }
    catch (err) {
        console.error(err.stack);
    }
}
exports.clearSearchHistory = clearSearchHistory;
//# sourceMappingURL=searchHistory.js.map