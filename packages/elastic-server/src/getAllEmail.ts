import { Client } from '@elastic/elasticsearch'
import { dbName, defaultLimit, elasticServer } from '@klonzo/common'
import { Request, Response } from 'express'
import moment from 'moment'

function createSearchParams(httpQuery) {
  console.log(httpQuery)
  let queryParams = ''
  if (httpQuery.clientSubmitTimeSearchString) {
    const day = new Date(httpQuery.clientSubmitTimeSearchString)

    // default to just the specified day
    let dayStart = moment(day).startOf('day')
    let dayEnd = moment(day).endOf('day')

    // is there a time span?
    if (httpQuery.clientSubmitTimeSpan) {
      dayStart = moment(dayStart).subtract(
        +httpQuery.clientSubmitTimeSpan,
        'day'
      )
      dayEnd = moment(dayEnd).add(+httpQuery.clientSubmitTimeSpan, 'day')
    }

    queryParams += `clientSubmitTime:[${dayStart
      .toDate()
      .getTime()} TO ${dayEnd.toDate().getTime()}] `
  }

  if (httpQuery.allTextSearchString) {
    queryParams += `(body:"${httpQuery.allTextSearchString}") OR `
    queryParams += `(displayTo:"${httpQuery.allTextSearchString}") OR `
    queryParams += `(senderName:"${httpQuery.allTextSearchString}") OR (senderEmailAddress:"${httpQuery.allTextSearchString}") | `
    queryParams += `(subject:"${httpQuery.allTextSearchString}")`
  } else {
    // body
    if (httpQuery.bodySearchString) {
      if (queryParams) {
        queryParams += ' AND '
      }
      queryParams += `body:"${httpQuery.bodySearchString}"`
    }

    // displayTo
    if (httpQuery.toSearchString) {
      if (queryParams) {
        queryParams += ' AND '
      }
      queryParams += `(displayTo:"${httpQuery.toSearchString}" OR displayBCC:"${httpQuery.toSearchString}" OR displayCC:"${httpQuery.toSearchString}") `
    }

    // senderName
    if (httpQuery.senderSearchString) {
      if (queryParams) {
        queryParams += ' AND '
      }
      queryParams += `(senderName:"${httpQuery.senderSearchString}" OR senderEmailAddress:"${httpQuery.senderSearchString}") `
    }

    // subject
    if (httpQuery.subjectSearchString) {
      if (queryParams) {
        queryParams += ' AND '
      }
      queryParams += `subject:"${httpQuery.subjectSearchString}" `
    }
  }

  if (!queryParams) {
    queryParams = '*'
  }

  console.log(queryParams)
  return queryParams
}

const createSortOrder = (httpQuery) => {
  // https://www.elastic.co/guide/en/elasticsearch/reference/current/fielddata.html
  let sort = ''
  if (httpQuery.sort) {
    sort += httpQuery.sort
    if (httpQuery.order) {
      sort +=
        (httpQuery.sort === 'sent' ? ':' : '.keyword:') +
        (httpQuery.order === '1' ? 'asc' : 'desc')
    }
  }
  return sort
}

// HTTP GET /email/
export async function getAllEmail(req: Request, res: Response): Promise<void> {
  try {
    const client = new Client({ node: elasticServer })

    const { body } = await client.search({
      index: dbName,
      from: req.query.skip ? +req.query.skip : 0,
      q: createSearchParams(req.query),
      size: req.query.limit ? +req.query.limit : defaultLimit,
      sort: createSortOrder(req.query),
    })

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
