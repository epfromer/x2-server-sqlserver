import {
  dbName,
  defaultLimit,
  emailCollection,
  HTTPQuery,
} from '@klonzo/common'
import * as dotenv from 'dotenv'
import { Request, Response } from 'express'
import redis from 'redis'
import redisearch from 'redis-redisearch'
import { promisify } from 'util'

redisearch(redis)
dotenv.config()

// https://oss.redislabs.com/redisearch/Commands.html#ftsearch
// https://oss.redislabs.com/redisearch/Query_Syntax.html#a_few_query_examples
const client = redis.createClient()
const ftSearchAsync = promisify(client.ft_search).bind(client)

const createSearchParams = (httpQuery: HTTPQuery) => {
  // console.log(httpQuery)

  let { allText, from, to, subject, body } = httpQuery
  if (allText) allText = allText.toLowerCase()
  if (from) from = from.toLowerCase()
  if (to) to = to.toLowerCase()
  if (subject) subject = subject.toLowerCase()
  if (body) body = body.toLowerCase()
  const { sent, timeSpan } = httpQuery

  let query = ''

  if (sent) {
    const start = new Date(sent)
    const end = new Date(start.getTime())
    end.setDate(end.getDate() + 1)
    // is there a time span?
    if (timeSpan && timeSpan > 0) {
      start.setDate(start.getDate() - +timeSpan)
      end.setDate(end.getDate() + +timeSpan)
    }
    query +=
      `(email_sent >= '${new Date(start).toISOString().slice(0, 10)}' and ` +
      `email_sent <= '${new Date(end).toISOString().slice(0, 10)}')`
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
      `)`
  } else {
    // Else, we have specific field searching.
    if (from) {
      query +=
        (query ? ' and ' : '') +
        `(` +
        `email_from_lc like '%${from}%' or ` +
        `email_from_custodian_lc like '%${from}%'` +
        `)`
    }
    if (to) {
      query +=
        (query ? ' and ' : '') +
        `(` +
        `email_to_lc like '%${to}%' or ` +
        `email_to_custodians_lc like '%${to}%' or ` +
        `email_cc_lc like '%${to}%' or ` +
        `email_bcc_lc like '%${to}%'` +
        `)`
    }
    if (subject) {
      query +=
        (query ? ' and ' : '') +
        `(` +
        `email_subject_lc like '%${subject}%'` +
        `)`
    }
    if (body) {
      query +=
        (query ? ' and ' : '') + `(` + `email_body_lc like '%${body}%'` + `)`
    }
  }

  // console.log(query)
  return query
}

// HTTP GET /email/
export async function getAllEmail(req: Request, res: Response): Promise<void> {
  try {
    const emailArr = await ftSearchAsync([
      dbName + emailCollection,
      '*',
      'LIMIT',
      req.query.skip ? +req.query.skip : 0,
      req.query.limit ? +req.query.limit : defaultLimit,
    ])

    const total = emailArr[0]
    const emails = []
    // Redis response is array of name followed by value, so need to do some funky
    // assignments to get it into Object
    let i = 1
    while (i < emailArr.length) {
      const id = emailArr[i]
      const docArr = emailArr[i + 1]
      i = i + 2
      // 'document' is returned as array of name followed by value entries
      // and they can be in any order, so need to convert to Object
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const doc: any = {}
      if (!docArr) console.log(id, docArr)
      for (let j = 0; j < docArr.length; j = j + 2) {
        doc[docArr[j]] = docArr[j + 1]
      }
      emails.push({
        id,
        sent: new Date(doc.sent),
        sentShort: new Date(doc.sent).toISOString().slice(0, 10),
        from: doc.from,
        fromCustodian: doc.fromCustodian,
        to: doc.to,
        toCustodians: doc.toCustodians ? doc.toCustodians.split(',') : [],
        cc: doc.cc,
        bcc: doc.bcc,
        subject: doc.subject,
        body: doc.body,
      })
    }

    res.json({ total, emails })

    // const query = createSearchParams(req.query)
    // const total = await knex(emailCollection).whereRaw(query).count()
    // const emails = await knex(emailCollection)
    //   .orderBy(
    //     req.query.sort ? 'email_' + req.query.sort : 'email_sent',
    //     req.query.order === '1' ? 'asc' : 'desc'
    //   )
    //   .whereRaw(query)
  } catch (err) {
    console.error(err.stack)
    res.status(500).send(err.msg)
  }
}
