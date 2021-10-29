"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@klonzo/common");
const redis_1 = __importDefault(require("redis"));
const redis_redisearch_1 = __importDefault(require("redis-redisearch"));
const util_1 = require("util");
const uuid_1 = require("uuid");
(0, redis_redisearch_1.default)(redis_1.default);
async function run() {
    if (!(0, common_1.getNumPSTs)(process.argv[2])) {
        process.send(`no PSTs found in ${process.argv[2]}`);
        return;
    }
    process.send(`connect to localhost`);
    const client = redis_1.default.createClient();
    const ftDropAsync = (0, util_1.promisify)(client.ft_drop).bind(client);
    // https://oss.redislabs.com/redisearch/Commands.html#ftcreate
    const ftCreateAsync = (0, util_1.promisify)(client.ft_create).bind(client);
    const ftAddAsync = (0, util_1.promisify)(client.ft_add).bind(client);
    const insertEmails = async (emails) => {
        emails.forEach(async (email) => {
            await ftAddAsync([
                common_1.dbName + common_1.emailCollection,
                (0, uuid_1.v4)(),
                1.0,
                'FIELDS',
                'type',
                'email',
                'sent',
                new Date(email.sent).getTime(),
                'sentStr',
                new Date(email.sent),
                'from',
                email.from,
                'fromCustodian',
                email.fromCustodian,
                'to',
                email.to,
                'toCustodians',
                email.toCustodians.join(','),
                'cc',
                email.cc,
                'bcc',
                email.bcc,
                'subject',
                email.subject,
                'body',
                email.body,
            ]);
        });
    };
    const insertWordCloud = async (wordCloud) => {
        await ftAddAsync([
            common_1.dbName + common_1.wordCloudCollection,
            'wordcloud',
            1.0,
            'FIELDS',
            'wordcloud',
            JSON.stringify(wordCloud),
        ]);
    };
    const insertEmailSentByDay = async (emailSentByDay) => {
        await ftAddAsync([
            common_1.dbName + common_1.emailSentByDayCollection,
            'emailSentByDay',
            1.0,
            'FIELDS',
            'emailSentByDay',
            JSON.stringify(emailSentByDay),
        ]);
    };
    const insertCustodians = async (custodians) => {
        await ftAddAsync([
            common_1.dbName + common_1.custodianCollection,
            'custodians',
            1.0,
            'FIELDS',
            'custodians',
            JSON.stringify(custodians),
        ]);
    };
    process.send(`drop database`);
    try {
        await ftDropAsync([common_1.dbName + common_1.emailCollection]);
        await ftDropAsync([common_1.dbName + common_1.wordCloudCollection]);
        await ftDropAsync([common_1.dbName + common_1.emailSentByDayCollection]);
        await ftDropAsync([common_1.dbName + common_1.custodianCollection]);
        await ftDropAsync([common_1.dbName + common_1.searchHistoryCollection]);
    }
    catch (err) {
        console.error(err);
    }
    process.send(`create database`);
    await ftCreateAsync([
        common_1.dbName + common_1.emailCollection,
        'SCHEMA',
        'type',
        'TEXT',
        'sent',
        'NUMERIC',
        'SORTABLE',
        'sentStr',
        'TEXT',
        'from',
        'TEXT',
        'SORTABLE',
        'fromCustodian',
        'TEXT',
        'to',
        'TEXT',
        'SORTABLE',
        'toCustodians',
        'TEXT',
        'cc',
        'TEXT',
        'bcc',
        'TEXT',
        'subject',
        'TEXT',
        'SORTABLE',
        'body',
        'TEXT',
    ]);
    await ftCreateAsync([
        common_1.dbName + common_1.wordCloudCollection,
        'SCHEMA',
        'wordcloud',
        'TEXT',
    ]);
    await ftCreateAsync([
        common_1.dbName + common_1.emailSentByDayCollection,
        'SCHEMA',
        'emailsentbyday',
        'TEXT',
    ]);
    await ftCreateAsync([
        common_1.dbName + common_1.custodianCollection,
        'SCHEMA',
        'custodians',
        'TEXT',
    ]);
    await ftCreateAsync([
        common_1.dbName + common_1.searchHistoryCollection,
        'SCHEMA',
        'type',
        'TEXT',
        'timestamp',
        'TEXT',
        'SORTABLE',
        'entry',
        'TEXT',
    ]);
    process.send(`process emails`);
    const numEmails = await (0, common_1.walkFSfolder)(process.argv[2], insertEmails, (msg) => process.send(msg));
    process.send(`process word cloud`);
    await (0, common_1.processWordCloud)(insertWordCloud, (msg) => process.send(msg));
    process.send(`process email sent`);
    await (0, common_1.processEmailSentByDay)(insertEmailSentByDay, (msg) => process.send(msg));
    process.send(`create custodians`);
    await (0, common_1.processCustodians)(insertCustodians, (msg) => process.send(msg));
    process.send(`completed ${numEmails} emails in ${process.argv[2]}`);
    client.quit();
}
run().catch((err) => console.error(err));
//# sourceMappingURL=doImport.js.map