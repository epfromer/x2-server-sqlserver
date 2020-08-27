import { contactCollection } from '@klonzo/common'
import { Request, Response } from 'express'
import * as mongodb from 'mongodb'
import { db } from './index'

export async function setContact(req: Request, res: Response): Promise<void> {
  try {
    // should have some validation, but assume ok for now
    const doc = await db
      .collection(contactCollection)
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
