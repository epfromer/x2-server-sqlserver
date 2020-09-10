import { dbName, wordCloudCollection } from '@klonzo/common'
import * as dotenv from 'dotenv'
import { Request, Response } from 'express'
dotenv.config()

// HTTP GET /wordcloud
export async function getWordCloud(req: Request, res: Response): Promise<void> {
  try {
    // const wordCloud = await knex(wordCloudCollection)
    // res.json(
    //   wordCloud.map((word) => ({
    //     tag: word.tag,
    //     weight: word.weight,
    //   }))
    // )
  } catch (err) {
    console.error(err.stack)
    res.status(500).send(err.msg)
  }
}
