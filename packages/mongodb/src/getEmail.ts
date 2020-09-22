import {
  dbName,
  defaultLimit,
  emailCollection,
  EmailTotal,
  HTTPQuery,
} from '@klonzo/common'
import * as mongodb from 'mongodb'

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

  const { id, allText, sent, timeSpan, from, to, subject, body } = httpQuery

  const query: query = {}

  // get single email?
  if (id) return { id }

  if (sent) {
    const start = new Date(sent)
    const end = new Date(start.getTime())
    end.setDate(end.getDate() + 1)

    // is there a time span?
    if (timeSpan && timeSpan > 0) {
      start.setDate(start.getDate() - +timeSpan)
      end.setDate(end.getDate() + +timeSpan)
    }

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
    console.log('httpQuery', httpQuery)
    const client = await mongodb.MongoClient.connect(process.env.MONGODB_HOST, {
      useUnifiedTopology: false,
    })
    const db = client.db(dbName)
    const query = createSearchParams(httpQuery)
    const total = await db.collection(emailCollection).countDocuments(query)
    let emails = await db
      .collection(emailCollection)
      .find(query)
      .sort(createSortOrder(httpQuery))
      .skip(httpQuery.skip ? +httpQuery.skip : 0)
      .limit(httpQuery.limit ? +httpQuery.limit : defaultLimit)
      .toArray()

    emails = emails.map((email) => ({
      id: email.id,
      sent: email.sent,
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

    return {
      total,
      emails,
    }
  } catch (err) {
    console.error(err.stack)
  }
}
