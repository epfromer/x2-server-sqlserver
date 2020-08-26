/* eslint-disable @typescript-eslint/no-explicit-any */
import * as config from 'config'
import { db } from './index'
import * as mongodb from 'mongodb'

// HTTP GET /email/<id>
export async function getSpecificEmail(req: any, res: any): Promise<void> {
  try {
    const doc = await db
      .collection(config.get('dbEmailCollection'))
      .findOne({ _id: new mongodb.ObjectId(req.params.id) })
    res.json(doc)
  } catch (err) {
    console.error(err.stack)
    res.status(500).send(err.msg)
  }
}
