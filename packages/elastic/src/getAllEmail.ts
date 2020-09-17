import { Client } from '@elastic/elasticsearch'
import { dbName, defaultLimit } from '@klonzo/common'
import * as dotenv from 'dotenv'
import { Request, Response } from 'express'
dotenv.config()

const createSearchParams = (httpQuery) => {
  // console.log(httpQuery)

  const { allText, sent, timeSpan, from, to, subject, body } = httpQuery

  let query = ''

  if (sent) {
    const start = new Date(sent)
    const end = new Date(start.getTime())
    end.setDate(end.getDate() + 1)

    if (timeSpan && timeSpan > 0) {
      start.setDate(start.getDate() - +timeSpan)
      end.setDate(end.getDate() + +timeSpan)
    }

    query += `sent:[${start.getTime()} TO ${end.getTime()}] `
  }

  if (allText) {
    query += `body:"${allText}" OR `
    query += `to:"${allText}" OR toCustodian:"${allText}" OR bcc:"${allText}" OR cc:"${allText}" OR `
    query += `from:"${allText}" OR fromCustodian:"${allText}" OR `
    query += `subject:"${allText}"`
  } else {
    if (from) {
      query += query ? ' AND ' : ''
      // check if searching only named Custodians, delimited with ()
      if (from.indexOf('(') >= 0) {
        query += `fromCustodian:"${from}" `
      } else {
        query += `from:"${from}" `
      }
    }
    if (to) {
      query += query ? ' AND ' : ''
      // check if searching only named Custodians, delimited with ()
      if (to.indexOf('(') >= 0) {
        query += `toCustodian:"${to}" `
      } else {
        query += `to:"${to}" `
      }
    }
    if (subject) {
      query += query ? ' AND ' : ''
      query += `subject:"${subject}" `
    }
    if (body) {
      query += query ? ' AND ' : ''
      query += `body:"${body}"`
    }
  }

  if (!query) {
    query = '*'
  }

  // console.log(query)
  return query
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
    const client = new Client({
      node: `http://${process.env.ELASTIC_HOST}:${process.env.ELASTIC_PORT}`,
    })

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
      sentShort: new Date(email._source.sent).toISOString().slice(0, 10),
      from: email._source.from,
      fromCustodian: email._source.fromCustodian,
      to: email._source.to,
      toCustodian: email._source.toCustodian,
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
