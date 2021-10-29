"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearSearchHistory = exports.getSearchHistory = void 0;
const common_1 = require("@klonzo/common");
const promise_1 = __importDefault(require("mysql2/promise"));
async function getSearchHistory() {
    try {
        const connection = await promise_1.default.createConnection({
            host: process.env.MYSQL_HOST,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_ROOT_PASSWORD,
            database: common_1.dbName,
        });
        const [rows] = await connection.execute(`select * from ${common_1.searchHistoryCollection} order by time_stamp desc`);
        connection.end();
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return rows.map((entry) => ({
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
        const connection = await promise_1.default.createConnection({
            host: process.env.MYSQL_HOST,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_ROOT_PASSWORD,
            database: common_1.dbName,
        });
        await connection.execute(`truncate table ${common_1.searchHistoryCollection}`);
        connection.end();
        return `Search history cleared`;
    }
    catch (err) {
        console.error(err.stack);
    }
}
exports.clearSearchHistory = clearSearchHistory;
//# sourceMappingURL=searchHistory.js.map