"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.root = void 0;
const common_1 = require("@klonzo/common");
const promise_1 = __importDefault(require("mysql2/promise"));
const getEmail_1 = require("./getEmail");
const importPST_1 = require("./importPST");
const searchHistory_1 = require("./searchHistory");
const getWordCloud = async () => {
    try {
        const connection = await promise_1.default.createConnection({
            host: process.env.MYSQL_HOST,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_ROOT_PASSWORD,
            database: common_1.dbName,
        });
        const [rows] = await connection.execute(`select * from ${common_1.wordCloudCollection}`);
        connection.end();
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return rows.map((word) => ({
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
        const connection = await promise_1.default.createConnection({
            host: process.env.MYSQL_HOST,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_ROOT_PASSWORD,
            database: common_1.dbName,
        });
        const [rows] = await connection.execute(`select * from ${common_1.emailSentByDayCollection} order by day_sent asc`);
        connection.end();
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return rows.map((day) => ({
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
        const connection = await promise_1.default.createConnection({
            host: process.env.MYSQL_HOST,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_ROOT_PASSWORD,
            database: common_1.dbName,
        });
        const [rows] = await connection.execute(`select * from ${common_1.custodianCollection} order by custodian_id asc`);
        connection.end();
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return rows.map((custodian) => ({
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
    const connection = await promise_1.default.createConnection({
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_ROOT_PASSWORD,
        database: common_1.dbName,
    });
    await connection.execute(`update ${common_1.custodianCollection} set color = '${httpQuery.color}' where custodian_id = '${httpQuery.id}'`);
    const [rows] = await connection.execute(`select * from ${common_1.custodianCollection} order by custodian_id asc`);
    connection.end();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return rows.map((custodian) => ({
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