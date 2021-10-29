"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@klonzo/common");
const mssql_1 = __importDefault(require("mssql"));
const uuid_1 = require("uuid");
async function run() {
    if (!(0, common_1.getNumPSTs)(process.argv[2])) {
        process.send(`no PSTs found in ${process.argv[2]}`);
        return;
    }
    process.send(`connect to ${process.env.SQL_HOST}`);
    let pool = await mssql_1.default.connect({
        server: process.env.SQL_HOST,
        user: process.env.SQL_USER,
        password: process.env.SQL_PASSWORD,
        trustServerCertificate: true,
    });
    const insertEmails = async (emails) => {
        const table = new mssql_1.default.Table(common_1.emailCollection);
        table.create = true;
        table.columns.add('email_id', mssql_1.default.VarChar((0, uuid_1.v4)().length), {
            nullable: false,
            primary: true,
        });
        table.columns.add('email_sent', mssql_1.default.DateTime2, { nullable: false });
        table.columns.add('email_from', mssql_1.default.VarChar(mssql_1.default.MAX), { nullable: false });
        table.columns.add('email_from_lc', mssql_1.default.VarChar(mssql_1.default.MAX), {
            nullable: false,
        });
        table.columns.add('email_from_custodian', mssql_1.default.VarChar(mssql_1.default.MAX), {
            nullable: false,
        });
        table.columns.add('email_from_custodian_lc', mssql_1.default.VarChar(mssql_1.default.MAX), {
            nullable: false,
        });
        table.columns.add('email_to', mssql_1.default.VarChar(mssql_1.default.MAX), { nullable: false });
        table.columns.add('email_to_lc', mssql_1.default.VarChar(mssql_1.default.MAX), { nullable: false });
        table.columns.add('email_to_custodians', mssql_1.default.VarChar(mssql_1.default.MAX), {
            nullable: false,
        });
        table.columns.add('email_to_custodians_lc', mssql_1.default.VarChar(mssql_1.default.MAX), {
            nullable: false,
        });
        table.columns.add('email_cc', mssql_1.default.VarChar(mssql_1.default.MAX), { nullable: false });
        table.columns.add('email_cc_lc', mssql_1.default.VarChar(mssql_1.default.MAX), {
            nullable: false,
        });
        table.columns.add('email_bcc', mssql_1.default.VarChar(mssql_1.default.MAX), { nullable: false });
        table.columns.add('email_bcc_lc', mssql_1.default.VarChar(mssql_1.default.MAX), { nullable: false });
        table.columns.add('email_subject', mssql_1.default.VarChar(mssql_1.default.MAX), {
            nullable: false,
        });
        table.columns.add('email_subject_lc', mssql_1.default.VarChar(mssql_1.default.MAX), {
            nullable: false,
        });
        table.columns.add('email_body', mssql_1.default.VarChar(mssql_1.default.MAX), { nullable: false });
        table.columns.add('email_body_lc', mssql_1.default.VarChar(mssql_1.default.MAX), {
            nullable: false,
        });
        emails.forEach((email) => {
            table.rows.add((0, uuid_1.v4)(), new Date(email.sent), email.from, email.from.toLowerCase(), email.fromCustodian, email.fromCustodian.toLowerCase(), email.to, email.to.toLowerCase(), email.toCustodians.toString(), email.toCustodians.toString().toLowerCase(), email.cc, email.cc.toLowerCase(), email.bcc, email.bcc.toLowerCase(), email.subject, email.subject.toLowerCase(), email.body, email.body.toLowerCase());
        });
        const request = new mssql_1.default.Request(pool);
        await request.bulk(table);
    };
    const insertWordCloud = async (wordCloud) => {
        const table = new mssql_1.default.Table(common_1.wordCloudCollection);
        table.create = true;
        table.columns.add('tag', mssql_1.default.VarChar(256), { nullable: false });
        table.columns.add('weight', mssql_1.default.VarChar(256), { nullable: false });
        wordCloud.forEach((word) => table.rows.add(word.tag, word.weight));
        const request = new mssql_1.default.Request(pool);
        await request.bulk(table);
    };
    const insertEmailSentByDay = async (emailSentByDay) => {
        const table = new mssql_1.default.Table(common_1.emailSentByDayCollection);
        table.create = true;
        table.columns.add('day_sent', mssql_1.default.VarChar(30), { nullable: false });
        table.columns.add('total', mssql_1.default.Int, { nullable: false });
        emailSentByDay.forEach((day) => table.rows.add(day.sent, day.total));
        const request = new mssql_1.default.Request(pool);
        await request.bulk(table);
    };
    const insertCustodians = async (custodians) => {
        const pool = await mssql_1.default.connect({
            server: process.env.SQL_HOST,
            user: process.env.SQL_USER,
            password: process.env.SQL_PASSWORD,
            database: common_1.dbName,
            trustServerCertificate: true,
        });
        const table = new mssql_1.default.Table(common_1.custodianCollection);
        table.create = true;
        table.columns.add('custodian_id', mssql_1.default.VarChar(30), { nullable: false });
        table.columns.add('custodian_name', mssql_1.default.VarChar(100), { nullable: false });
        table.columns.add('title', mssql_1.default.VarChar(256), { nullable: false });
        table.columns.add('color', mssql_1.default.VarChar(100), { nullable: false });
        table.columns.add('sender_total', mssql_1.default.Int, { nullable: false });
        table.columns.add('receiver_total', mssql_1.default.Int, { nullable: false });
        table.columns.add('to_custodians', mssql_1.default.VarChar(mssql_1.default.MAX), {
            nullable: false,
        });
        custodians.forEach((custodian) => table.rows.add(custodian.id, custodian.name, custodian.title, custodian.color, custodian.senderTotal, custodian.receiverTotal, JSON.stringify(custodian.toCustodians)));
        const request = new mssql_1.default.Request(pool);
        await request.bulk(table);
    };
    process.send(`drop database`);
    await pool.query('drop database if exists ' + common_1.dbName);
    process.send(`create database`);
    await pool.query('create database ' + common_1.dbName);
    await pool.close();
    pool = await mssql_1.default.connect({
        server: process.env.SQL_HOST,
        user: process.env.SQL_USER,
        password: process.env.SQL_PASSWORD,
        database: common_1.dbName,
        trustServerCertificate: true,
    });
    await pool.query(`create table ${common_1.searchHistoryCollection} (history_id varchar(255) primary key, time_stamp varchar(25) not null, entry varchar(255) not null)`);
    process.send(`process emails`);
    const numEmails = await (0, common_1.walkFSfolder)(process.argv[2], insertEmails, (msg) => process.send(msg));
    process.send(`process word cloud`);
    await (0, common_1.processWordCloud)(insertWordCloud, (msg) => process.send(msg));
    process.send(`process email sent`);
    await (0, common_1.processEmailSentByDay)(insertEmailSentByDay, (msg) => process.send(msg));
    process.send(`create custodians`);
    await (0, common_1.processCustodians)(insertCustodians, (msg) => process.send(msg));
    process.send(`completed ${numEmails} emails in ${process.argv[2]}`);
    await pool.close();
}
run().catch((err) => console.error(err));
//# sourceMappingURL=doImport.js.map