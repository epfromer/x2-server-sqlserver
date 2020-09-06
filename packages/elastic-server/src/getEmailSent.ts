import { Client } from '@elastic/elasticsearch'
import { dbName, elasticServer, emailSentByDayCollection } from '@klonzo/common'
import { Request, Response } from 'express'

export async function getEmailSent(eq: Request, res: Response): Promise<void> {
  try {
    const client = new Client({ node: elasticServer })
    const { body } = await client.search({
      index: dbName + emailSentByDayCollection,
      q: '*',
    })
    res.json(body.hits.hits[0]._source.emailSentCollection)
  } catch (err) {
    console.error(err.stack)
    res.status(500).send(err.msg)
  }
}
