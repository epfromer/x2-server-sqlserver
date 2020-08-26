/* eslint-disable @typescript-eslint/no-explicit-any */
import * as config from 'config'
import { db } from './index'

interface HTTPQuery {
  sent?: string
  timeSpan?: number
  allText?: string
  from?: string
  to?: string
  subject?: string
  body?: string
}

interface MongoSent {
  $gte: Date
  $lte: Date
}

interface MongoQuery {
  sent?: MongoSent
  $text?: {}
  from?: RegExp
  fromContact?: RegExp
  to?: RegExp
  toContact?: RegExp
  subject?: RegExp
  body?: RegExp
}

/**
 * Create search parameters.  We use case insensitive search with regexp, will be slow
 * on million dox or more in that case, store lower-case content and convert query to
 * lower-case to search with indexes set up.
 * TODO: benchmark this performance
 */
function createSearchParams(httpQuery: HTTPQuery): MongoQuery {
  const mongoQuery: MongoQuery = {}
  if (httpQuery.sent) {
    const dayStart = new Date(httpQuery.sent)
    const dayEnd = new Date(dayStart.getTime())
    dayEnd.setDate(dayEnd.getDate() + 1)

    // is there a time span?
    if (httpQuery.timeSpan && httpQuery.timeSpan > 0) {
      dayStart.setDate(dayStart.getDate() - +httpQuery.timeSpan)
      dayEnd.setDate(dayEnd.getDate() + +httpQuery.timeSpan)
    }

    mongoQuery.sent = {
      $gte: dayStart,
      $lte: dayEnd,
    }
  }

  // Text searching is complex.  If using allText, then use the $text
  // fulltext searching provided by Mongo, but cannot limit that to a specific
  // text field - it searches all text indexes.  At least with MongoDB 3.6.
  if (httpQuery.allText) {
    // any text field
    mongoQuery.$text = {
      $search: httpQuery.allText,
    }
  } else {
    // Else, we have specific field searching.  Here, have to use regular
    // expressions ignoring case targeting specific fields, which requires
    // full collection scans and will be slower on big collections.
    if (httpQuery.from) {
      // check if searching only named contacts, delimited with ()
      if (httpQuery.from.indexOf('(') >= 0) {
        mongoQuery.fromContact = new RegExp(httpQuery.from, 'i')
      } else {
        mongoQuery.from = new RegExp(httpQuery.from, 'i')
      }
    }
    // to
    if (httpQuery.to) {
      // check if searching only named contacts, delimited with ()
      if (httpQuery.to.indexOf('(') >= 0) {
        mongoQuery.toContact = new RegExp(httpQuery.to, 'i')
      } else {
        mongoQuery.to = new RegExp(httpQuery.to, 'i')
      }
    }
    // subject
    if (httpQuery.subject) {
      mongoQuery.subject = new RegExp(httpQuery.subject, 'i')
    }
    // body
    if (httpQuery.body) {
      mongoQuery.body = new RegExp(httpQuery.body, 'i')
    }
  }

  return mongoQuery
}

// HTTP GET /email/
export async function getAllEmail(req: any, res: any): Promise<void> {
  try {
    const skip = req.query.skip ? +req.query.skip : 0
    const limit = req.query.limit ? +req.query.limit : 50

    // determine sort order, if any
    interface Sort {
      [index: string]: number
    }
    const sort: Sort = {}
    if (req.query.sort) {
      sort[req.query.sort as string] = req.query.order === '1' ? 1 : -1
    }

    const query = createSearchParams(req.query)

    // get total
    const total = await db
      .collection(config.get('dbEmailCollection'))
      .countDocuments(query as any)

    // do query, with sort if specified
    let emails
    if (sort) {
      emails = await db
        .collection(config.get('dbEmailCollection'))
        .find(query as any)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .toArray()
    } else {
      emails = await db
        .collection(config.get('dbEmailCollection'))
        .find(query as any)
        .skip(skip)
        .limit(limit)
        .toArray()
    }

    res.json({
      total,
      emails,
    })
  } catch (err) {
    console.error(err.stack)
    res.status(500).send(err.msg)
  }
}
