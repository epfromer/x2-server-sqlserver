import { wordCloudCollection } from '@klonzo/common'
import { Request, Response } from 'express'

// HTTP GET /wordcloud
export async function getWordCloud(req: Request, res: Response): Promise<void> {
  try {
    // const wordCloud = await db.collection(wordCloudCollection).find().toArray()
    const wordCloud = {}
    res.json(wordCloud)
  } catch (err) {
    console.error(err.stack)
    res.status(500).send(err.msg)
  }
}
