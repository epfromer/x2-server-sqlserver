import { dbName, wordCloudCollection } from '@klonzo/common'
import { Request, Response } from 'express'
import * as mongodb from 'mongodb'

// HTTP GET /wordcloud
export async function getWordCloud(req: Request, res: Response): Promise<void> {
  try {
    const client = await mongodb.MongoClient.connect(process.env.MONGODB_HOST, {
      useUnifiedTopology: false,
    })
    const db = client.db(dbName)
    const wordCloud = await db.collection(wordCloudCollection).find().toArray()
    res.json(
      wordCloud.map((word) => ({
        tag: word.tag,
        weight: word.weight,
      }))
    )
  } catch (err) {
    console.error(err.stack)
    res.status(500).send(err.msg)
  }
}
