import { Client } from '@elastic/elasticsearch'
import { dbName, elasticServer, defaultLimit } from '@klonzo/common'
import { Request, Response } from 'express'

const createSortOrder = (httpQuery) => {
  let sort = ''
  if (httpQuery.sort) {
    sort += httpQuery.sort
    if (httpQuery.order) {
      sort += ':' + (httpQuery.order === '1' ? 'asc' : 'desc')
    }
  }
  return sort
}

// HTTP GET /email/
export async function getAllEmail(req: Request, res: Response): Promise<void> {
  try {
    const client = new Client({ node: elasticServer })

    // const queryParams = createSearchParams(req.query);

    const { body } = await client.search({
      index: dbName,
      from: req.query.skip ? +req.query.skip : 0,
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
