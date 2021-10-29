"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.root = void 0;
const common_1 = require("@klonzo/common");
const pg_1 = require("pg");
const getEmail_1 = require("./getEmail");
const importPST_1 = require("./importPST");
const searchHistory_1 = require("./searchHistory");
// https://node-postgres.com/features/pooling
const getWordCloud = async () => {
    try {
        const pool = new pg_1.Pool({ database: common_1.dbName });
        const result = await pool.query(`select * from ${common_1.wordCloudCollection}`);
        return result.rows.map((word) => ({
            tag: word.tag,
            weight: word.weight,
        }));
    }
    catch (err) {
        console.error(err.stack);
    }
};
const getEmailSentByDay = async () => {
    try {
        const pool = new pg_1.Pool({ database: common_1.dbName });
        const result = await pool.query(`select * from ${common_1.emailSentByDayCollection} order by day_sent asc`);
        return result.rows.map((day) => ({
            sent: day.day_sent,
            emailIds: day.total,
        }));
    }
    catch (err) {
        console.error(err.stack);
    }
};
const getCustodians = async () => {
    try {
        const pool = new pg_1.Pool({ database: common_1.dbName });
        const result = await pool.query(`select * from ${common_1.custodianCollection} order by custodian_id asc`);
        return result.rows.map((custodian) => ({
            id: custodian.custodian_id,
            name: custodian.custodian_name,
            title: custodian.title,
            color: custodian.color,
            senderTotal: custodian.sender_total,
            receiverTotal: custodian.receiver_total,
            toCustodians: JSON.parse(custodian.to_custodians),
        }));
    }
    catch (err) {
        console.error(err.stack);
    }
};
const setCustodianColor = async (httpQuery) => {
    const pool = new pg_1.Pool({ database: common_1.dbName });
    await pool.query(`update ${common_1.custodianCollection} set color = '${httpQuery.color}' where custodian_id = '${httpQuery.id}'`);
    const result = await pool.query(`select * from ${common_1.custodianCollection} order by custodian_id asc`);
    return result.rows.map((custodian) => ({
        id: custodian.custodian_id,
        name: custodian.custodian_name,
        title: custodian.title,
        color: custodian.color,
        senderTotal: custodian.sender_total,
        receiverTotal: custodian.receiver_total,
        toCustodians: JSON.parse(custodian.to_custodians),
    }));
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