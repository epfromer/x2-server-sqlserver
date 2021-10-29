"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEmail = void 0;
const common_1 = require("@klonzo/common");
const promise_1 = __importDefault(require("mysql2/promise"));
const uuid_1 = require("uuid");
const createWhereClause = (httpQuery) => {
    // console.log(httpQuery)
    let { allText, from, to, subject, body } = httpQuery;
    if (allText)
        allText = allText.toLowerCase();
    if (from)
        from = from.toLowerCase();
    if (to)
        to = to.toLowerCase();
    if (subject)
        subject = subject.toLowerCase();
    if (body)
        body = body.toLowerCase();
    const { id, sent } = httpQuery;
    // get single email?
    if (id)
        return `email_id = '${id}'`;
    let query = '';
    if (sent) {
        const start = new Date(sent);
        const end = new Date(start.getTime());
        end.setDate(end.getDate() + 1);
        query +=
            `(email_sent >= '${new Date(start).toISOString().slice(0, 10)}' and ` +
                `email_sent <= '${new Date(end).toISOString().slice(0, 10)}')`;
    }
    if (allText) {
        // any text field?
        query +=
            (query ? ' and ' : '') +
                `(` +
                `email_from_lc like '%${allText}%' or ` +
                `email_from_custodian_lc like '%${allText}%' or ` +
                `email_to_lc like '%${allText}%' or ` +
                `email_to_custodians_lc like '%${allText}%' or ` +
                `email_cc_lc like '%${allText}%' or ` +
                `email_bcc_lc like '%${allText}%' or ` +
                `email_subject_lc like '%${allText}%' or ` +
                `email_body_lc like '%${allText}%'` +
                `)`;
    }
    else {
        // Else, we have specific field searching.
        if (from) {
            query +=
                (query ? ' and ' : '') +
                    `(` +
                    `email_from_lc like '%${from}%' or ` +
                    `email_from_custodian_lc like '%${from}%'` +
                    `)`;
        }
        if (to) {
            query +=
                (query ? ' and ' : '') +
                    `(` +
                    `email_to_lc like '%${to}%' or ` +
                    `email_to_custodians_lc like '%${to}%' or ` +
                    `email_cc_lc like '%${to}%' or ` +
                    `email_bcc_lc like '%${to}%'` +
                    `)`;
        }
        if (subject) {
            query +=
                (query ? ' and ' : '') +
                    `(` +
                    `email_subject_lc like '%${subject}%'` +
                    `)`;
        }
        if (body) {
            query +=
                (query ? ' and ' : '') + `(` + `email_body_lc like '%${body}%'` + `)`;
        }
    }
    // console.log(query)
    return query;
};
const sort = (httpQuery) => {
    const { sort } = httpQuery;
    if (!sort || sort === 'sent')
        return 'email_sent';
    return 'email_' + sort + '_sort';
};
async function getEmail(httpQuery) {
    try {
        const start = Date.now();
        let qTotal = `select count(*) as total from ${common_1.emailCollection}`;
        let q = `select * from ${common_1.emailCollection}`;
        const whereClause = createWhereClause(httpQuery);
        if (whereClause) {
            qTotal += ' where ' + whereClause;
            q += ' where ' + whereClause;
        }
        q +=
            ` order by ${sort(httpQuery)} ${httpQuery.order === 1 ? 'asc' : 'desc'}` +
                ` limit ${httpQuery.limit ? +httpQuery.limit : common_1.defaultLimit}` +
                ` offset ${httpQuery.skip ? +httpQuery.skip : 0} `;
        const connection = await promise_1.default.createConnection({
            host: process.env.MYSQL_HOST,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_ROOT_PASSWORD,
            database: common_1.dbName,
        });
        const [rows] = await connection.execute(q);
        const [resultTotal] = await connection.execute(qTotal);
        // connection.end()
        delete httpQuery.skip;
        delete httpQuery.limit;
        const strQuery = JSON.stringify(httpQuery);
        // save query if not the initial
        if (strQuery !== common_1.startupQuery) {
            const q = `insert into ${common_1.searchHistoryCollection} (history_id, time_stamp, entry) values (?, ?, ?)`;
            await connection.execute(q, [
                (0, uuid_1.v4)(),
                new Date().toISOString(),
                strQuery,
            ]);
        }
        const total = +resultTotal[0].total;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const emails = rows.map((email) => ({
            id: email.email_id,
            sent: email.email_sent,
            sentShort: new Date(email.email_sent).toISOString().slice(0, 10),
            from: email.email_from,
            fromCustodian: email.email_from_custodian,
            to: email.email_to,
            toCustodians: email.email_to_custodians
                ? email.email_to_custodians.split(',')
                : [],
            cc: email.email_cc,
            bcc: email.email_bcc,
            subject: email.email_subject,
            body: email.email_body,
        }));
        console.log('mysql', httpQuery, total, Date.now() - start);
        return { total, emails };
    }
    catch (err) {
        console.error(err);
    }
}
exports.getEmail = getEmail;
//# sourceMappingURL=getEmail.js.map