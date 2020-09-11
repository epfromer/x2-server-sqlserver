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
  // https://oss.redislabs.com/redisearch/Query_Syntax.html#field_modifiers

  // console.log(httpQuery)

  const { from, to, subject, body, allText, sent, timeSpan } = httpQuery

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
    query += ` @sent:[${new Date(start).getTime()} ${new Date(end).getTime()}] `
  }

  if (allText) {
    // any text field?
    query += ` @from|fromCustodian|emailto|toCustodians|cc|bcc|subject|body:${allText} `
  } else {
    // Else, we have specific field searching.
    if (from) query += ` @from|fromCustodian:${from} `
    if (to) query += ` @emailto|toCustodians|cc|bcc:${to} `
    if (subject) query += ` @subject:${subject} `
    if (body) query += ` @body:${body} `
  }

  if (!query) query = '*'

  console.log(query)
  return query
}

// HTTP GET /email/
export async function getAllEmail(req: Request, res: Response): Promise<void> {
  try {
    const emailArr = await ftSearchAsync([
      dbName + emailCollection,
      createSearchParams(req.query),
      'LIMIT',
      req.query.skip ? +req.query.skip : 0,
      req.query.limit ? +req.query.limit : defaultLimit,
      'SORTBY',
      req.query.sort ? req.query.sort : 'sent',
      req.query.order === '1' ? 'asc' : 'desc',
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
        sent: new Date(doc.sentStr),
        sentShort: new Date(doc.sentStr).toISOString().slice(0, 10),
        from: doc.from,
        fromCustodian: doc.fromCustodian,
        to: doc.emailto,
        toCustodians: doc.toCustodians ? doc.toCustodians.split(',') : [],
        cc: doc.cc,
        bcc: doc.bcc,
        subject: doc.subject,
        body: doc.body,
      })
    }

    res.json({ total, emails })
  } catch (err) {
    console.error(err.stack)
    res.status(500).send(err.msg)
  }
}
