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
const common_1 = require("@klonzo/common");
const mongodb = __importStar(require("mongodb"));
async function run() {
    if (!(0, common_1.getNumPSTs)(process.argv[2])) {
        process.send(`no PSTs found in ${process.argv[2]}`);
        return;
    }
    process.send(`connect to ${process.env.MONGODB_HOST}`);
    const client = await mongodb.MongoClient.connect(process.env.MONGODB_HOST);
    const db = client.db(common_1.dbName);
    const insertEmails = async (email) => {
        await db.collection(common_1.emailCollection).insertMany(email);
    };
    const insertWordCloud = async (wordCloud) => {
        await db.collection(common_1.wordCloudCollection).insertMany(wordCloud);
    };
    const insertEmailSentByDay = async (emailSentByDay) => {
        await db.collection(common_1.emailSentByDayCollection).insertMany(emailSentByDay);
    };
    const insertCustodians = async (Custodians) => {
        await db.collection(common_1.custodianCollection).insertMany(Custodians);
    };
    process.send(`drop database`);
    await db.dropDatabase();
    process.send(`process emails`);
    const numEmails = await (0, common_1.walkFSfolder)(process.argv[2], insertEmails, (msg) => process.send(msg));
    process.send(`process word cloud`);
    await (0, common_1.processWordCloud)(insertWordCloud, (msg) => process.send(msg));
    process.send(`process email sent`);
    await (0, common_1.processEmailSentByDay)(insertEmailSentByDay, (msg) => process.send(msg));
    process.send(`create custodians`);
    await (0, common_1.processCustodians)(insertCustodians, (msg) => process.send(msg));
    process.send(`create index`);
    await db.collection(common_1.emailCollection).createIndex({ '$**': 'text' });
    process.send(`completed ${numEmails} emails in ${process.argv[2]}`);
    client.close();
}
run().catch((err) => console.error(err));
//# sourceMappingURL=doImport.js.map