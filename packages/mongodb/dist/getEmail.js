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
exports.getEmail = void 0;
const common_1 = require("@klonzo/common");
const mongodb = __importStar(require("mongodb"));
const uuid_1 = require("uuid");
const createSearchParams = (httpQuery) => {
    // console.log(httpQuery)
    const { id, allText, sent, from, to, subject, body } = httpQuery;
    // get single email?
    if (id)
        return { id };
    const query = {};
    if (sent) {
        const start = new Date(sent);
        const end = new Date(start.getTime());
        end.setDate(end.getDate() + 1);
        query.sent = {
            $gte: start,
            $lte: end,
        };
    }
    // Text searching is complex.  If using allText, then use the $text
    // fulltext searching provided by Mongo, but cannot limit that to a specific
    // text field - it searches all text indexes.  At least with MongoDB 3.6.
    if (allText) {
        // any text field
        query.$text = {
            $search: allText,
        };
    }
    else {
        // Else, we have specific field searching.
        const queryArr = [];
        if (from) {
            const re = new RegExp(from, 'i');
            queryArr.push({
                $or: [{ fromCustodian: re }, { from: re }],
            });
        }
        if (to) {
            const re = new RegExp(to, 'i');
            queryArr.push({
                $or: [{ toCustodian: re }, { to: re }, { cc: re }, { bcc: re }],
            });
        }
        if (subject) {
            queryArr.push({
                subject: new RegExp(subject, 'i'),
            });
        }
        if (body) {
            queryArr.push({
                body: new RegExp(body, 'i'),
            });
        }
        if (queryArr.length)
            query.$and = queryArr;
    }
    // console.log(query)
    return query;
};
const createSortOrder = (httpQuery) => {
    const sort = {};
    if (httpQuery.sort) {
        sort[httpQuery.sort] = httpQuery.order === 1 ? 1 : -1;
    }
    return sort;
};
async function getEmail(httpQuery) {
    try {
        const start = Date.now();
        const client = await mongodb.MongoClient.connect(process.env.MONGODB_HOST);
        const db = client.db(common_1.dbName);
        const query = createSearchParams(httpQuery);
        const total = await db.collection(common_1.emailCollection).countDocuments(query);
        const dox = await db
            .collection(common_1.emailCollection)
            .find(query)
            .collation({ locale: 'en' })
            .sort(createSortOrder(httpQuery))
            .skip(httpQuery.skip ? +httpQuery.skip : 0)
            .limit(httpQuery.limit ? +httpQuery.limit : common_1.defaultLimit)
            .toArray();
        const emails = dox.map((email) => ({
            id: email.id,
            sent: new Date(new Date(email.sent).toISOString()),
            sentShort: new Date(email.sent).toISOString().slice(0, 10),
            from: email.from,
            fromCustodian: email.fromCustodian,
            to: email.to,
            toCustodians: email.toCustodians,
            cc: email.cc,
            bcc: email.bcc,
            subject: email.subject,
            body: email.body,
        }));
        delete httpQuery.skip;
        delete httpQuery.limit;
        const strQuery = JSON.stringify(httpQuery);
        // save query if not the initial
        if (strQuery !== common_1.startupQuery) {
            await db.collection(common_1.searchHistoryCollection).insertOne({
                id: (0, uuid_1.v4)(),
                timestamp: new Date().toISOString(),
                entry: strQuery,
            });
        }
        console.log('mongodb', httpQuery, total, Date.now() - start);
        return { total, emails };
    }
    catch (err) {
        console.error(err);
    }
}
exports.getEmail = getEmail;
//# sourceMappingURL=getEmail.js.map