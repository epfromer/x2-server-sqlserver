import { Client } from '@elastic/elasticsearch'
import { custodianCollection, dbName } from '@klonzo/common'
import { Request, Response } from 'express'

// HTTP GET /custodians
export async function getCustodians(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const client = new Client({
      node: `http://${process.env.ELASTIC_HOST}:${process.env.ELASTIC_PORT}`,
    })

    const { body } = await client.search({
      index: dbName + custodianCollection,
      q: '*',
      sort: 'id.keyword:asc',
    })

    const custodians = body.hits.hits.map((custodian) => ({
      id: custodian._source.id,
      name: custodian._source.name,
      title: custodian._source.title,
      color: custodian._source.color,
      senderTotal: custodian._source.senderTotal,
      receiverTotal: custodian._source.receiverTotal,
      toCustodians: custodian._source.toCustodians,
      fromCustodians: custodian._source.fromCustodians,
    }))

    res.json(custodians)
  } catch (err) {
    console.error(err.stack)
    res.status(500).send(err.msg)
  }
}
