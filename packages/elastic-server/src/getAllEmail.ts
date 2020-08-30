import { Client } from '@elastic/elasticsearch'
import { dbName, elasticServer } from '@klonzo/common'
import { Request, Response } from 'express'

/**
 * Create search parameters.  We use case insensitive search with regexp, will be slow
 * on million dox or more in that case, store lower-case content and convert query to
 * lower-case to search with indexes set up.
 * TODO: benchmark this performance
 */
// function createSearchParams(httpQuery: HTTPQuery): MongoQuery {
//   const mongoQuery: MongoQuery = {}
//   if (httpQuery.sent) {
//     const dayStart = new Date(httpQuery.sent)
//     const dayEnd = new Date(dayStart.getTime())
//     dayEnd.setDate(dayEnd.getDate() + 1)

//     // is there a time span?
//     if (httpQuery.timeSpan && httpQuery.timeSpan > 0) {
//       dayStart.setDate(dayStart.getDate() - +httpQuery.timeSpan)
//       dayEnd.setDate(dayEnd.getDate() + +httpQuery.timeSpan)
//     }

//     mongoQuery.sent = {
//       $gte: dayStart,
//       $lte: dayEnd,
//     }
//   }

//   // Text searching is complex.  If using allText, then use the $text
//   // fulltext searching provided by Mongo, but cannot limit that to a specific
//   // text field - it searches all text indexes.  At least with MongoDB 3.6.
//   if (httpQuery.allText) {
//     // any text field
//     mongoQuery.$text = {
//       $search: httpQuery.allText,
//     }
//   } else {
//     // Else, we have specific field searching.  Here, have to use regular
//     // expressions ignoring case targeting specific fields, which requires
//     // full collection scans and will be slower on big collections.
//     if (httpQuery.from) {
//       // check if searching only named contacts, delimited with ()
//       if (httpQuery.from.indexOf('(') >= 0) {
//         mongoQuery.fromContact = new RegExp(httpQuery.from, 'i')
//       } else {
//         mongoQuery.from = new RegExp(httpQuery.from, 'i')
//       }
//     }
//     // to
//     if (httpQuery.to) {
//       // check if searching only named contacts, delimited with ()
//       if (httpQuery.to.indexOf('(') >= 0) {
//         mongoQuery.toContact = new RegExp(httpQuery.to, 'i')
//       } else {
//         mongoQuery.to = new RegExp(httpQuery.to, 'i')
//       }
//     }
//     // subject
//     if (httpQuery.subject) {
//       mongoQuery.subject = new RegExp(httpQuery.subject, 'i')
//     }
//     // body
//     if (httpQuery.body) {
//       mongoQuery.body = new RegExp(httpQuery.body, 'i')
//     }
//   }

//   return mongoQuery
// }

// HTTP GET /email/
export async function getAllEmail(req: Request, res: Response): Promise<void> {
  try {
    const client = new Client({ node: elasticServer })

    const skip = req.query.skip ? +req.query.skip : 0
    const limit = req.query.limit ? +req.query.limit : 50

    // determine sort order, if any
    // interface Sort {
    //   [index: string]: number
    // }
    // const sort: Sort = {}
    // if (req.query.sort) {
    //   sort[req.query.sort as string] = req.query.order === '1' ? 1 : -1
    // }

    // const query = createSearchParams(req.query)

    // get total
    // const total = await db.collection(emailCollection).countDocuments(query)

    // do query, with sort if specified
    // if (sort) {
    //   emails = await db
    //     .collection(emailCollection)
    //     .find(query)
    //     .sort(sort)
    //     .skip(skip)
    //     .limit(limit)
    //     .toArray()
    // } else {
    //   emails = await db
    //     .collection(emailCollection)
    //     .find(query)
    //     .skip(skip)
    //     .limit(limit)
    //     .toArray()
    // }

    const { body } = await client.search({
      index: dbName,
      body: {
        query: {
          match: {
            body: 'enron',
          },
        },
      },
    })
    console.log(body)

    const emails = body.hits.hits.map((email) => ({
      id: email._source.id,
      sent: email._source.sent,
      sentShort: email._source.sentShort,
      from: email._source.from,
      fromContact: email._source.fromContact,
      to: email._source.to,
      toContact: email._source.toContact,
      cc: email._source.cc,
      bcc: email._source.bcc,
      subject: email._source.subject,
      body: email._source.body,
    }))

    res.json({
      total: body.hits.total.value,
      emails,
    })
  } catch (err) {
    console.error(err.stack)
    res.status(500).send(err.msg)
  }
}
