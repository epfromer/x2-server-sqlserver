/* eslint-disable @typescript-eslint/no-explicit-any */
import * as config from 'config'
import * as mongodb from 'mongodb'
import { db } from './index'

export async function setContact(req: any, res: any): Promise<void> {
  try {
    // should have some validation, but assume ok for now
    const doc = await db
      .collection(config.get('dbContactsCollection'))
      .findOneAndUpdate(
        { _id: new mongodb.ObjectId(req.params.id) },
        { $set: req.body }
      )
    res.status(200).send(doc)
  } catch (err) {
    console.error(err.stack)
    res.status(500).send(err.msg)
  }
}
