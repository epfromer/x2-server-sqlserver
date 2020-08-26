/* eslint-disable @typescript-eslint/no-explicit-any */
import * as config from 'config'
import { db } from './index'

// HTTP GET /wordcloud
export async function getWordCloud(req: any, res: any): Promise<void> {
  try {
    const wordCloud = await db
      .collection(config.get('dbWordCloudCollection'))
      .find()
      .toArray()
    res.json(wordCloud)
  } catch (err) {
    console.error(err.stack)
    res.status(500).send(err.msg)
  }
}
