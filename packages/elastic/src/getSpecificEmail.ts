import { Client } from '@elastic/elasticsearch'
import { dbName } from '@klonzo/common'
import * as dotenv from 'dotenv'
import { Request, Response } from 'express'
dotenv.config()

// HTTP GET /email/<id>
export async function getSpecificEmail(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const client = new Client({
      node: `http://${process.env.ELASTIC_HOST}:${process.env.ELASTIC_PORT}`,
    })

    const { body } = await client.search({
      index: dbName,
      q: `id:${req.params.id}`,
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const email: any = {}
    if (body.hits.hits && body.hits.hits.length) {
      const hit = body.hits.hits[0]._source
      if (hit.id === req.params.id) {
        email.id = hit.id
        email.sent = hit.sent
        email.sentShort = new Date(hit.sent).toISOString().slice(0, 10)
        email.from = hit.from
        email.fromCustodian = hit.fromCustodian
        email.to = hit.to
        email.toCustodians = hit.toCustodians
        email.cc = hit.cc
        email.bcc = hit.bcc
        email.subject = hit.subject
        email.body = hit.body
      }
    }

    res.json(email)
  } catch (err) {
    console.error(err.stack)
    res.status(500).send(err.msg)
  }
}
