"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const elasticsearch_1 = require("@elastic/elasticsearch");
const common_1 = require("@klonzo/common");
const dotenv = __importStar(require("dotenv"));
const uuid_1 = require("uuid");
dotenv.config();
// https://www.elastic.co/blog/new-elasticsearch-javascript-client-released
// https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/7.x/introduction.html
// http://localhost:9200/x2
// http://localhost:9200/x2/_search?q=*
async function run() {
    if (!(0, common_1.getNumPSTs)(process.argv[2])) {
        process.send(`no PSTs found in ${process.argv[2]}`);
        return;
    }
    process.send(`connect to http://${process.env.ELASTIC_HOST}:${process.env.ELASTIC_PORT}`);
    const client = new elasticsearch_1.Client({
        node: `http://${process.env.ELASTIC_HOST}:${process.env.ELASTIC_PORT}`,
    });
    const insertEmails = async (emails) => {
        emails.forEach(async (email) => {
            await client.index({
                index: common_1.dbName + common_1.emailCollection,
                body: {
                    id: (0, uuid_1.v4)(),
                    sent: new Date(email.sent).toISOString(),
                    from: email.from,
                    fromCustodian: email.fromCustodian,
                    to: email.to,
                    toCustodians: email.toCustodians,
                    cc: email.cc,
                    bcc: email.bcc,
                    subject: email.subject,
                    body: email.body,
                },
            });
        });
    };
    const insertWordCloud = async (wordCloud) => {
        await client.index({
            index: common_1.dbName + common_1.wordCloudCollection,
            body: {
                wordCloudCollection: wordCloud,
            },
        });
    };
    const insertEmailSentByDay = async (email) => {
        await client.index({
            index: common_1.dbName + common_1.emailSentByDayCollection,
            body: {
                emailSentCollection: email,
            },
        });
    };
    const insertCustodians = async (custodians) => {
        custodians.forEach(async (custodian) => {
            await client.index({
                index: common_1.dbName + common_1.custodianCollection,
                id: custodian.id,
                body: {
                    id: custodian.id,
                    name: custodian.name,
                    title: custodian.title,
                    color: custodian.color,
                    senderTotal: custodian.senderTotal,
                    receiverTotal: custodian.receiverTotal,
                    toCustodians: custodian.toCustodians,
                },
            });
        });
    };
    process.send(`drop database`);
    try {
        await client.indices.delete({ index: common_1.dbName + common_1.emailCollection });
        await client.indices.delete({ index: common_1.dbName + common_1.wordCloudCollection });
        await client.indices.delete({ index: common_1.dbName + common_1.emailSentByDayCollection });
        await client.indices.delete({ index: common_1.dbName + common_1.custodianCollection });
        await client.indices.delete({ index: common_1.dbName + common_1.searchHistoryCollection });
    }
    catch (error) {
        console.error(error);
    }
    process.send(`create index`);
    await client.indices.create({ index: common_1.dbName + common_1.emailCollection });
    await client.indices.create({ index: common_1.dbName + common_1.wordCloudCollection });
    await client.indices.create({ index: common_1.dbName + common_1.emailSentByDayCollection });
    await client.indices.create({ index: common_1.dbName + common_1.custodianCollection });
    await client.indices.create({ index: common_1.dbName + common_1.searchHistoryCollection });
    process.send(`process emails`);
    const numEmails = await (0, common_1.walkFSfolder)(process.argv[2], insertEmails, (msg) => process.send(msg));
    process.send(`process word cloud`);
    await (0, common_1.processWordCloud)(insertWordCloud, (msg) => process.send(msg));
    process.send(`process email sent`);
    await (0, common_1.processEmailSentByDay)(insertEmailSentByDay, (msg) => process.send(msg));
    process.send(`process custodians`);
    await (0, common_1.processCustodians)(insertCustodians, (msg) => process.send(msg));
    process.send(`refresh index`);
    await client.indices.refresh({ index: common_1.dbName + common_1.emailCollection });
    await client.indices.refresh({ index: common_1.dbName + common_1.wordCloudCollection });
    await client.indices.refresh({ index: common_1.dbName + common_1.emailSentByDayCollection });
    await client.indices.refresh({ index: common_1.dbName + common_1.custodianCollection });
    process.send(`completed ${numEmails} emails in ${process.argv[2]}`);
}
run().catch((err) => console.error(err));
//# sourceMappingURL=doImport.js.map