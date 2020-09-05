import { Client } from '@elastic/elasticsearch'
import { contactCollection, dbName, elasticServer } from '@klonzo/common'
import { Request, Response } from 'express'

// HTTP GET /contacts
export async function getContacts(req: Request, res: Response): Promise<void> {
  try {
    const client = new Client({ node: elasticServer })
    const { body } = await client.search({
      index: dbName + contactCollection,
      q: '*',
    })
    res.json(body.hits.hits[0]._source.contactCollection)
  } catch (err) {
    console.error(err.stack)
    res.status(500).send(err.msg)
  }
}
