import {
  dbName,
  defaultLimit,
  Email,
  emailCollection,
  EmailTotal,
  HTTPQuery,
  searchHistoryCollection,
  startupQuery,
} from '@klonzo/common'
import * as mongodb from 'mongodb'
import { v4 as uuidv4 } from 'uuid'

interface MongoSent {
  $gte: Date
  $lte: Date
}

interface query {
  id?: string
  sent?: MongoSent
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  $and?: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  $text?: any
  subject?: RegExp
  body?: RegExp
}

const createSearchParams = (httpQuery: HTTPQuery): query => {
  // console.log(httpQuery)

  const { id, allText, sent, from, to, subject, body } = httpQuery

  // get single email?
  if (id) return { id }

  const query: query = {}

  if (sent) {
    const start = new Date(sent)
    const end = new Date(start.getTime())
    end.setDate(end.getDate() + 1)

    query.sent = {
      $gte: start,
      $lte: end,
    }
  }

  // Text searching is complex.  If using allText, then use the $text
  // fulltext searching provided by Mongo, but cannot limit that to a specific
  // text field - it searches all text indexes.  At least with MongoDB 3.6.
  if (allText) {
    // any text field
    query.$text = {
      $search: allText,
    }
  } else {
    // Else, we have specific field searching.
    const queryArr = []
    if (from) {
      const re = new RegExp(from, 'i')
      queryArr.push({
        $or: [{ fromCustodian: re }, { from: re }],
      })
    }
    if (to) {
      const re = new RegExp(to, 'i')
      queryArr.push({
        $or: [{ toCustodian: re }, { to: re }, { cc: re }, { bcc: re }],
      })
    }
    if (subject) {
      queryArr.push({
        subject: new RegExp(subject, 'i'),
      })
    }
    if (body) {
      queryArr.push({
        body: new RegExp(body, 'i'),
      })
    }
    if (queryArr.length) query.$and = queryArr
  }

  // console.log(query)
  return query
}

const createSortOrder = (httpQuery) => {
  interface Sort {
    [index: string]: number
  }
  const sort: Sort = {}
  if (httpQuery.sort) {
    sort[httpQuery.sort as string] = httpQuery.order === 1 ? 1 : -1
  }
  return sort
}

export async function getEmail(httpQuery: HTTPQuery): Promise<EmailTotal> {
  try {
    const start = Date.now()
    const client = await mongodb.MongoClient.connect(process.env.MONGODB_HOST)
    const db = client.db(dbName)
    const query = createSearchParams(httpQuery)
    const total = await db.collection(emailCollection).countDocuments(query)
    const dox = await db
      .collection(emailCollection)
      .find(query)
      .collation({ locale: 'en' })
      .sort(createSortOrder(httpQuery) as mongodb.Sort)
      .skip(httpQuery.skip ? +httpQuery.skip : 0)
      .limit(httpQuery.limit ? +httpQuery.limit : defaultLimit)
      .toArray()

    const emails: Email[] = dox.map((email) => ({
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
    }))

    delete httpQuery.skip
    delete httpQuery.limit
    const strQuery = JSON.stringify(httpQuery)
    // save query if not the initial
    if (strQuery !== startupQuery) {
      await db.collection(searchHistoryCollection).insertOne({
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        entry: strQuery,
      })
    }

    console.log('mongodb', httpQuery, total, Date.now() - start)
    return { total, emails }
  } catch (err) {
    console.error(err)
  }
}
