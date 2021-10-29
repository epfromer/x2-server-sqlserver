"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@klonzo/common");
const promise_1 = __importDefault(require("mysql2/promise"));
const uuid_1 = require("uuid");
async function run() {
    if (!(0, common_1.getNumPSTs)(process.argv[2])) {
        process.send(`no PSTs found in ${process.argv[2]}`);
        return;
    }
    process.send(`connect to ${process.env.MYSQL_HOST}`);
    let connection = await promise_1.default.createConnection({
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_ROOT_PASSWORD,
    });
    const insertEmails = async (emails) => {
        const q = `insert into ${common_1.emailCollection} (
      email_id, 
      email_sent, 
      email_from, 
      email_from_sort, 
      email_from_lc, 
      email_from_custodian, 
      email_from_custodian_lc, 
      email_to, 
      email_to_sort, 
      email_to_lc, 
      email_to_custodians, 
      email_to_custodians_lc, 
      email_cc, 
      email_cc_lc, 
      email_bcc, 
      email_bcc_lc, 
      email_subject, 
      email_subject_sort, 
      email_subject_lc, 
      email_body, 
      email_body_lc) 
      values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        emails.forEach(async (email) => {
            await connection.execute(q, [
                (0, uuid_1.v4)(),
                email.sent,
                email.from,
                email.from.slice(0, 254),
                email.from.toLowerCase(),
                email.fromCustodian,
                email.fromCustodian.toLowerCase(),
                email.to,
                email.to.slice(0, 254),
                email.to.toLowerCase(),
                email.toCustodians.toString(),
                email.toCustodians.toString().toLowerCase(),
                email.cc,
                email.cc.toLowerCase(),
                email.bcc,
                email.bcc.toLowerCase(),
                email.subject,
                email.subject.slice(0, 254),
                email.subject.toLowerCase(),
                email.body,
                email.body.toLowerCase(), // email_body_lc
            ]);
        });
    };
    const insertWordCloud = async (wordCloud) => {
        const q = `insert into ${common_1.wordCloudCollection} (tag, weight) values (?, ?)`;
        wordCloud.forEach(async (word) => {
            await connection.execute(q, [word.tag, word.weight]);
        });
    };
    const insertEmailSentByDay = async (emailSentByDay) => {
        const q = `insert into ${common_1.emailSentByDayCollection} (day_sent, total) values (?, ?)`;
        emailSentByDay.forEach(async (day) => {
            // TODO
            await connection.execute(q, [day.sent, day.total]);
        });
    };
    const insertCustodians = async (custodians) => {
        const q = `insert into ${common_1.custodianCollection} (custodian_id, custodian_name, title, color, sender_total, receiver_total, to_custodians) values (?, ?, ?, ?, ?, ?, ?)`;
        custodians.forEach(async (custodian) => {
            await connection.execute(q, [
                custodian.id,
                custodian.name,
                custodian.title,
                custodian.color,
                custodian.senderTotal,
                custodian.receiverTotal,
                JSON.stringify(custodian.toCustodians),
            ]);
        });
    };
    process.send(`drop database`);
    await connection.execute('drop database if exists ' + common_1.dbName);
    process.send(`create database`);
    await connection.execute('create database ' + common_1.dbName);
    connection.end();
    connection = await promise_1.default.createConnection({
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_ROOT_PASSWORD,
        database: common_1.dbName,
    });
    await connection.execute(`create table ${common_1.emailCollection} (email_id varchar(255), email_sent timestamp, email_from text, email_from_sort varchar(255), email_from_lc text, email_from_custodian text, email_from_custodian_lc text, email_to text, email_to_sort varchar(255), email_to_lc text, email_to_custodians text, email_to_custodians_lc text, email_cc text, email_cc_lc text, email_bcc text, email_bcc_lc text, email_subject text, email_subject_sort varchar(255), email_subject_lc text, email_body longtext, email_body_lc longtext)`);
    await connection.execute(`alter table ${common_1.emailCollection} add primary key email_pkey(email_id)`);
    await connection.execute(`alter table ${common_1.emailCollection} add index email_email_sent_index(email_sent)`);
    await connection.execute(`alter table ${common_1.emailCollection} add index email_email_from_sort_index(email_from_sort)`);
    await connection.execute(`alter table ${common_1.emailCollection} add index email_email_to_sort_index(email_to_sort)`);
    await connection.execute(`alter table ${common_1.emailCollection} add index email_email_subject_sort_index(email_subject_sort)`);
    await connection.execute(`create table ${common_1.wordCloudCollection} (tag varchar(255), weight integer)`);
    await connection.execute(`alter table ${common_1.wordCloudCollection} add primary key wordcloud_pkey(tag)`);
    await connection.execute(`create table ${common_1.emailSentByDayCollection} (day_sent varchar(25), total integer)`);
    await connection.execute(`alter table ${common_1.emailSentByDayCollection} add primary key emailsentbyday_pkey(day_sent)`);
    await connection.execute(`create table ${common_1.custodianCollection} (custodian_id varchar(25), custodian_name text, title text, color text, sender_total integer, receiver_total integer, to_custodians text)`);
    await connection.execute(`alter table ${common_1.custodianCollection} add primary key custodians_pkey(custodian_id)`);
    await connection.execute(`create table ${common_1.searchHistoryCollection} (history_id varchar(255), time_stamp varchar(25), entry varchar(255))`);
    await connection.execute(`alter table ${common_1.searchHistoryCollection} add primary key history_id_pkey(history_id)`);
    await connection.execute(`alter table ${common_1.searchHistoryCollection} add index time_stamp_index(time_stamp)`);
    process.send(`process emails`);
    const numEmails = await (0, common_1.walkFSfolder)(process.argv[2], insertEmails, (msg) => process.send(msg));
    process.send(`process word cloud`);
    await (0, common_1.processWordCloud)(insertWordCloud, (msg) => process.send(msg));
    process.send(`process email sent`);
    await (0, common_1.processEmailSentByDay)(insertEmailSentByDay, (msg) => process.send(msg));
    process.send(`create custodians`);
    await (0, common_1.processCustodians)(insertCustodians, (msg) => process.send(msg));
    process.send(`completed ${numEmails} emails in ${process.argv[2]}`);
    connection.end();
}
run().catch((err) => console.error(err));
//# sourceMappingURL=doImport.js.map