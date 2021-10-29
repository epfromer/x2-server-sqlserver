"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearSearchHistory = exports.getSearchHistory = void 0;
const common_1 = require("@klonzo/common");
const mssql_1 = __importDefault(require("mssql"));
async function getSearchHistory() {
    try {
        const pool = await mssql_1.default.connect({
            server: process.env.SQL_HOST,
            user: process.env.SQL_USER,
            password: process.env.SQL_PASSWORD,
            database: common_1.dbName,
            trustServerCertificate: true,
        });
        const result = await pool.query(`select * from ${common_1.searchHistoryCollection} order by time_stamp desc`);
        return result.recordset.map((entry) => ({
            id: entry.history_id,
            timestamp: entry.time_stamp,
            entry: entry.entry,
        }));
        return [];
    }
    catch (err) {
        console.error(err.stack);
    }
}
exports.getSearchHistory = getSearchHistory;
async function clearSearchHistory() {
    try {
        const pool = await mssql_1.default.connect({
            server: process.env.SQL_HOST,
            user: process.env.SQL_USER,
            password: process.env.SQL_PASSWORD,
            database: common_1.dbName,
            trustServerCertificate: true,
        });
        await pool.query(`truncate table ${common_1.searchHistoryCollection}`);
        return `Search history cleared`;
    }
    catch (err) {
        console.error(err.stack);
    }
}
exports.clearSearchHistory = clearSearchHistory;
//# sourceMappingURL=searchHistory.js.map