"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@klonzo/common");
const pg_1 = require("pg");
const uuid_1 = require("uuid");
async function run() {
    if (!(0, common_1.getNumPSTs)(process.argv[2])) {
        process.send(`no PSTs found in ${process.argv[2]}`);
        return;
    }
    process.send(`connect to ${process.env.PGHOST}`);
    let pool = new pg_1.Pool();
    const insertEmails = async (emails) => {
        const q = `insert into ${common_1.emailCollection} (
      email_id, 
      email_sent, 
      email_from, 
      email_from_lc, 
      email_from_custodian, 
      email_from_custodian_lc, 
      email_to, 
      email_to_lc, 
      email_to_custodians, 
      email_to_custodians_lc, 
      email_cc, 
      email_cc_lc, 
      email_bcc, 
      email_bcc_lc, 
      email_subject, 
      email_subject_lc, 
      email_body, 
      email_body_lc) 
      values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)`;
        emails.forEach(async (email) => {
            await pool.query(q, [
                (0, uuid_1.v4)(),
                email.sent,
                email.from,
                email.from.toLowerCase(),
                email.fromCustodian,
                email.fromCustodian.toLowerCase(),
                email.to,
                email.to.toLowerCase(),
                email.toCustodians.toString(),
                email.toCustodians.toString().toLowerCase(),
                email.cc,
                email.cc.toLowerCase(),
                email.bcc,
                email.bcc.toLowerCase(),
                email.subject,
                email.subject.toLowerCase(),
                email.body,
                email.body.toLowerCase(), // email_body_lc
            ]);
        });
    };
    const insertWordCloud = async (wordCloud) => {
        const q = `insert into ${common_1.wordCloudCollection} (tag, weight) values ($1, $2)`;
        wordCloud.forEach(async (word) => {
            await pool.query(q, [word.tag, word.weight]);
        });
    };
    const insertEmailSentByDay = async (emailSentByDay) => {
        const q = `insert into ${common_1.emailSentByDayCollection} (day_sent, total) values ($1, $2)`;
        emailSentByDay.forEach(async (day) => {
            await pool.query(q, [day.sent, day.total]);
        });
    };
    const insertCustodians = async (custodians) => {
        const q = `insert into ${common_1.custodianCollection} (custodian_id, custodian_name, title, color, sender_total, receiver_total, to_custodians) values ($1, $2, $3, $4, $5, $6, $7)`;
        custodians.forEach(async (custodian) => {
            await pool.query(q, [
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
    try {
        await pool.query(`revoke connect on database ${common_1.dbName} from public`);
        await pool.query(`select pg_terminate_backend(pg_stat_activity.pid) from pg_stat_activity where pg_stat_activity.datname = '${common_1.dbName}'`);
    }
    catch (err) { }
    try {
        await pool.query('drop database if exists ' + common_1.dbName);
    }
    catch (err) { }
    process.send(`create database`);
    await pool.query('create database ' + common_1.dbName);
    pool = new pg_1.Pool({ database: common_1.dbName });
    await pool.query(`create table ${common_1.emailCollection} (email_id varchar(255), email_sent timestamptz, email_from text, email_from_lc text, email_from_custodian text, email_from_custodian_lc text, email_to text, email_to_lc text, email_to_custodians text, email_to_custodians_lc text, email_cc text, email_cc_lc text, email_bcc text, email_bcc_lc text, email_subject text, email_subject_lc text, email_body text, email_body_lc text)`);
    await pool.query(`alter table ${common_1.emailCollection} add constraint email_pkey primary key (email_id)`);
    await pool.query(`create table ${common_1.wordCloudCollection} (tag varchar(255), weight integer)`);
    await pool.query(`alter table ${common_1.wordCloudCollection} add constraint wordcloud_pkey primary key (tag)`);
    await pool.query(`create table ${common_1.emailSentByDayCollection} (day_sent timestamptz, total integer)`);
    await pool.query(`alter table ${common_1.emailSentByDayCollection} add constraint emailsentbyday_pkey primary key (day_sent)`);
    await pool.query(`create table ${common_1.custodianCollection} (custodian_id varchar(255), custodian_name text, title text, color text, sender_total integer, receiver_total integer, to_custodians text)`);
    await pool.query(`alter table ${common_1.custodianCollection} add constraint custodians_pkey primary key (custodian_id)`);
    await pool.query(`create table ${common_1.searchHistoryCollection} (history_id varchar(255), time_stamp varchar(25), entry varchar(255))`);
    await pool.query(`alter table ${common_1.searchHistoryCollection} add constraint history_id_pkey primary key (history_id)`);
    process.send(`process emails`);
    const numEmails = await (0, common_1.walkFSfolder)(process.argv[2], insertEmails, (msg) => process.send(msg));
    process.send(`process word cloud`);
    await (0, common_1.processWordCloud)(insertWordCloud, (msg) => process.send(msg));
    process.send(`process email sent`);
    await (0, common_1.processEmailSentByDay)(insertEmailSentByDay, (msg) => process.send(msg));
    process.send(`process custodians`);
    await (0, common_1.processCustodians)(insertCustodians, (msg) => process.send(msg));
    process.send(`completed ${numEmails} emails in ${process.argv[2]}`);
}
run().catch((err) => console.error(err));
//# sourceMappingURL=doImport.js.map