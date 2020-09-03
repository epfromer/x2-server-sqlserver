import { defaultLimit, emailCollection, HTTPQuery } from '@klonzo/common'
import { Request, Response } from 'express'
import { db } from './index'

interface MongoSent {
  $gte: Date
  $lte: Date
}

interface query {
  sent?: MongoSent
  $text?: any
  from?: RegExp
  fromContact?: RegExp
  to?: RegExp
  toContact?: RegExp
  subject?: RegExp
  body?: RegExp
}

const createSearchParams = (httpQuery: HTTPQuery): query => {
  // console.log(httpQuery)

  const { allText, sent, timeSpan, from, to, subject, body } = httpQuery

  const query: query = {}

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
    // Else, we have specific field searching.  Here, have to use regular
    // expressions ignoring case targeting specific fields, which requires
    // full collection scans and will be slower on big collections.
    if (from) {
      // check if searching only named contacts, delimited with ()
      if (from.indexOf('(') >= 0) {
        query.fromContact = new RegExp(from, 'i')
      } else {
        query.from = new RegExp(from, 'i')
      }
    }
    if (to) {
      // check if searching only named contacts, delimited with ()
      if (httpQuery.to.indexOf('(') >= 0) {
        query.toContact = new RegExp(to, 'i')
      } else {
        query.to = new RegExp(to, 'i')
      }
    }
    if (subject) {
      query.subject = new RegExp(subject, 'i')
    }
    if (body) {
      query.body = new RegExp(body, 'i')
    }
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
    sort[httpQuery.sort as string] = httpQuery.order === '1' ? 1 : -1
  }
  return sort
}

// HTTP GET /email/
export async function getAllEmail(req: Request, res: Response): Promise<void> {
  try {
    const query = createSearchParams(req.query)

    const total = await db.collection(emailCollection).countDocuments(query)

    let emails
    if (createSortOrder(req.query)) {
      emails = await db
        .collection(emailCollection)
        .find(query)
        .sort(createSortOrder(req.query))
        .skip(req.query.skip ? +req.query.skip : 0)
        .limit(req.query.limit ? +req.query.limit : defaultLimit)
        .toArray()
    } else {
      emails = await db
        .collection(emailCollection)
        .find(query)
        .skip(req.query.skip ? +req.query.skip : 0)
        .limit(req.query.limit ? +req.query.limit : defaultLimit)
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
