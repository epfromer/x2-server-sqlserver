import { Client } from '@elastic/elasticsearch'
import { custodianCollection, dbName, elasticServer } from '@klonzo/common'
import { Request, Response } from 'express'

// HTTP GET /Custodians
export async function getCustodians(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const client = new Client({ node: elasticServer })
    const { body } = await client.search({
      index: dbName + custodianCollection,
      q: '*',
    })
    console.log(body.hits.hits[0]._source)
    res.json(body.hits.hits[0]._source.custodianCollection)
  } catch (err) {
    console.error(err.stack)
    res.status(500).send(err.msg)
  }
}
