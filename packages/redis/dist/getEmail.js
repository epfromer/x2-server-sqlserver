"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEmail = void 0;
const common_1 = require("@klonzo/common");
const redis_1 = __importDefault(require("redis"));
const redis_redisearch_1 = __importDefault(require("redis-redisearch"));
const util_1 = require("util");
const uuid_1 = require("uuid");
(0, redis_redisearch_1.default)(redis_1.default);
// https://oss.redislabs.com/redisearch/Commands.html#ftsearch
// https://oss.redislabs.com/redisearch/Query_Syntax.html#a_few_query_examples
const client = redis_1.default.createClient();
const ftSearchAsync = (0, util_1.promisify)(client.ft_search).bind(client);
const ftAddAsync = (0, util_1.promisify)(client.ft_add).bind(client);
const ftGetAsync = (0, util_1.promisify)(client.ft_get).bind(client);
const createSearchParams = (httpQuery) => {
    // https://oss.redislabs.com/redisearch/Query_Syntax.html#field_modifiers
    // console.log(httpQuery)
    const { id, from, to, subject, body, allText, sent } = httpQuery;
    // get single email?
    if (id)
        return ` @id:${id} `;
    let query = ` @type:${common_1.emailCollection} `;
    if (sent) {
        const start = new Date(sent);
        const end = new Date(start.getTime());
        end.setDate(end.getDate() + 1);
        query += ` @sent:[${new Date(start).getTime()} ${new Date(end).getTime()}] `;
    }
    if (allText) {
        // any text field?
        query += ` @from|fromCustodian|emailto|toCustodians|cc|bcc|subject|body:${allText} `;
    }
    else {
        // Else, we have specific field searching.
        if (from)
            query += ` @from|fromCustodian:${from} `;
        if (to)
            query += ` @to|toCustodians|cc|bcc:${to} `;
        if (subject)
            query += ` @subject:${subject} `;
        if (body)
            query += ` @body:${body} `;
    }
    // console.log(query)
    return query;
};
// HTTP GET /email/
async function getEmail(httpQuery) {
    try {
        const start = Date.now();
        let emailArr;
        if (httpQuery.id) {
            emailArr = await ftGetAsync([common_1.dbName + common_1.emailCollection, httpQuery.id]);
        }
        else {
            emailArr = await ftSearchAsync([
                common_1.dbName + common_1.emailCollection,
                createSearchParams(httpQuery),
                'LIMIT',
                httpQuery.skip ? +httpQuery.skip : 0,
                httpQuery.limit ? +httpQuery.limit : common_1.defaultLimit,
                'SORTBY',
                httpQuery.sort ? httpQuery.sort : 'sent',
                httpQuery.order === 1 ? 'asc' : 'desc',
            ]);
        }
        const total = httpQuery.id ? 1 : emailArr[0];
        const emails = [];
        // Redis response is array of name followed by value, so need to do some funky
        // assignments to get it into Object
        let i = httpQuery.id ? 0 : 1;
        while (i < emailArr.length) {
            const id = httpQuery.id ? httpQuery.id : emailArr[i];
            const docArr = httpQuery.id ? emailArr : emailArr[i + 1];
            i = i + 2;
            // 'document' is returned as array of name followed by value entries
            // and they can be in any order, so need to convert to Object
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const doc = {};
            for (let j = 0; j < docArr.length; j = j + 2) {
                doc[docArr[j]] = docArr[j + 1];
            }
            emails.push({
                id,
                sent: '' + new Date(doc.sentStr).toISOString(),
                sentShort: new Date(doc.sentStr).toISOString().slice(0, 10),
                from: doc.from,
                fromCustodian: doc.fromCustodian,
                to: doc.to,
                toCustodians: doc.toCustodians ? doc.toCustodians.split(',') : [],
                cc: doc.cc,
                bcc: doc.bcc,
                subject: doc.subject,
                body: doc.body,
            });
        }
        delete httpQuery.skip;
        delete httpQuery.limit;
        const strQuery = JSON.stringify(httpQuery);
        // save query if not the initial
        if (strQuery !== common_1.startupQuery) {
            await ftAddAsync([
                common_1.dbName + common_1.searchHistoryCollection,
                (0, uuid_1.v4)(),
                1.0,
                'FIELDS',
                'type',
                common_1.searchHistoryCollection,
                'timestamp',
                new Date().toISOString(),
                'entry',
                strQuery,
            ]);
        }
        console.log('redis', httpQuery, total, Date.now() - start);
        return { total, emails };
    }
    catch (err) {
        console.error(err);
    }
}
exports.getEmail = getEmail;
//# sourceMappingURL=getEmail.js.map