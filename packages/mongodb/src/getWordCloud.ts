import { wordCloudCollection } from '@klonzo/common'
import { Request, Response } from 'express'
import { db } from './index'

// HTTP GET /wordcloud
export async function getWordCloud(req: Request, res: Response): Promise<void> {
  try {
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
