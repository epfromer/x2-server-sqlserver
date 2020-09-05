import { Client } from '@elastic/elasticsearch'
import { dbName, elasticServer, wordCloudCollection } from '@klonzo/common'
import { Request, Response } from 'express'

// HTTP GET /wordcloud
export async function getWordCloud(req: Request, res: Response): Promise<void> {
  try {
    const client = new Client({ node: elasticServer })
    const { body } = await client.search({
      index: dbName + wordCloudCollection,
      q: '*',
    })
    res.json(body.hits.hits[0]._source.wordCloudCollection)
  } catch (err) {
    console.error(err.stack)
    res.status(500).send(err.msg)
  }
}
