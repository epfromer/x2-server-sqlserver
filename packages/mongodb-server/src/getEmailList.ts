/* eslint-disable @typescript-eslint/no-explicit-any */
import * as config from 'config'
import { db } from './index'

interface MongoQuery {
  $or: [{ id: string }?]
}

// HTTP GET /emaillist?ids=id1;id2;id3...
export async function getEmailList(req: any, res: any): Promise<void> {
  try {
    const ids = req.query.ids.split(';')
    const mongoQuery: MongoQuery = { $or: [] }
    ids.forEach((id: string) => mongoQuery.$or.push({ id }))
    const doc = await db
      .collection(config.get('dbEmailCollection'))
      .find(mongoQuery as any)
      .toArray()
    res.json(doc)
  } catch (err) {
    console.error(err.stack)
    res.status(500).send(err.msg)
  }
}
