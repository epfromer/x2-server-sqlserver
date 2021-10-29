"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEmail = void 0;
const elasticsearch_1 = require("@elastic/elasticsearch");
const common_1 = require("@klonzo/common");
const uuid_1 = require("uuid");
const createSearchParams = (httpQuery) => {
    // console.log(httpQuery)
    const { id, allText, sent, from, to, subject, body } = httpQuery;
    // get single email?
    if (id)
        return `id:${id}`;
    let query = '';
    if (sent) {
        const start = new Date(sent);
        const end = new Date(start.getTime());
        end.setDate(end.getDate() + 1);
        query += `sent:[${start.getTime()} TO ${end.getTime()}] `;
    }
    if (allText) {
        query += `body:"${allText}" OR `;
        query += `to:"${allText}" OR toCustodian:"${allText}" OR bcc:"${allText}" OR cc:"${allText}" OR `;
        query += `from:"${allText}" OR fromCustodian:"${allText}" OR `;
        query += `subject:"${allText}"`;
    }
    else {
        if (from) {
            query += query ? ' AND ' : '';
            query += ` (from:"${from}" OR fromCustodian:"${from}") `;
        }
        if (to) {
            query += query ? ' AND ' : '';
            query += ` (to:"${to}" OR toCustodian:"${to}" OR bcc:"${to}" OR cc:"${to}") `;
        }
        if (subject) {
            query += query ? ' AND ' : '';
            query += `subject:"${subject}" `;
        }
        if (body) {
            query += query ? ' AND ' : '';
            query += `body:"${body}"`;
        }
    }
    if (!query) {
        query = '*';
    }
    // console.log(query)
    return query;
};
const createSortOrder = (httpQuery) => {
    // https://www.elastic.co/guide/en/elasticsearch/reference/current/fielddata.html
    let sort = '';
    if (httpQuery.sort) {
        sort += httpQuery.sort;
        if (httpQuery.order) {
            sort +=
                (httpQuery.sort === 'sent' ? ':' : '.keyword:') +
                    (httpQuery.order === 1 ? 'asc' : 'desc');
        }
    }
    return sort;
};
async function getEmail(httpQuery) {
    try {
        const start = Date.now();
        const client = new elasticsearch_1.Client({
            node: `http://${process.env.ELASTIC_HOST}:${process.env.ELASTIC_PORT}`,
        });
        // http://localhost:9200/_search
        // https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/7.x/api-reference.html#_search
        // https://www.elastic.co/guide/en/elasticsearch/reference/7.x/search-search.html
        const { body } = await client.search({
            index: common_1.dbName + common_1.emailCollection,
            from: httpQuery.skip ? +httpQuery.skip : 0,
            q: createSearchParams(httpQuery),
            size: httpQuery.limit ? +httpQuery.limit : common_1.defaultLimit,
            sort: createSortOrder(httpQuery),
            ignore_unavailable: true,
        });
        const emails = body.hits.hits.map((email) => ({
            id: email._source.id,
            sent: email._source.sent,
            sentShort: new Date(email._source.sent).toISOString().slice(0, 10),
            from: email._source.from,
            fromCustodian: email._source.fromCustodian,
            to: email._source.to,
            toCustodian: email._source.toCustodian,
            cc: email._source.cc,
            bcc: email._source.bcc,
            subject: email._source.subject,
            body: email._source.body,
        }));
        const total = body.hits.total.value;
        delete httpQuery.skip;
        delete httpQuery.limit;
        const strQuery = JSON.stringify(httpQuery);
        // save query if not the initial
        if (strQuery !== common_1.startupQuery) {
            await client.index({
                index: common_1.dbName + common_1.searchHistoryCollection,
                id: (0, uuid_1.v4)(),
                body: {
                    timestamp: new Date().toISOString(),
                    entry: strQuery,
                },
            });
            await client.indices.refresh({ index: common_1.dbName + common_1.searchHistoryCollection });
        }
        console.log('elastic', httpQuery, total, Date.now() - start);
        return { total, emails };
    }
    catch (err) {
        console.error(err);
    }
}
exports.getEmail = getEmail;
//# sourceMappingURL=getEmail.js.map