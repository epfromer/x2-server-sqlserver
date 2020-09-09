import { dbName, wordCloudCollection } from '@klonzo/common'
import * as dotenv from 'dotenv'
import { Request, Response } from 'express'
dotenv.config()

// eslint-disable-next-line @typescript-eslint/no-var-requires
const knex = require('knex')({
  client: 'pg',
  connection: {
    host: process.env.PGHOST,
    password: process.env.PGPASSWORD,
    database: dbName,
  },
})

// HTTP GET /wordcloud
export async function getWordCloud(req: Request, res: Response): Promise<void> {
  try {
    const wordCloud = await knex(wordCloudCollection)
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
