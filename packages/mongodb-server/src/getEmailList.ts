import { emailCollection } from '@klonzo/common'
import { Request, Response } from 'express'
import { db } from './index'

interface MongoQuery {
  $or: [{ id: string }?]
}

// HTTP GET /emaillist?ids=id1;id2;id3...
export async function getEmailList(req: Request, res: Response): Promise<void> {
  try {
    const ids = (req.query.ids as string).split(';')
    const mongoQuery: MongoQuery = { $or: [] }
    ids.forEach((id: string) => mongoQuery.$or.push({ id }))
    const doc = await db.collection(emailCollection).find(mongoQuery).toArray()
    res.json(doc)
  } catch (err) {
    console.error(err.stack)
    res.status(500).send(err.msg)
  }
}
