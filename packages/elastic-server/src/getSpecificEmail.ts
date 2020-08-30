import { emailCollection } from '@klonzo/common'
import { Request, Response } from 'express'
import * as mongodb from 'mongodb'

// HTTP GET /email/<id>
export async function getSpecificEmail(
  req: Request,
  res: Response
): Promise<void> {
  try {
    // const doc = await db
    //   .collection(emailCollection)
    //   .findOne({ _id: new mongodb.ObjectId(req.params.id) })
    const doc = {}
    res.json(doc)
  } catch (err) {
    console.error(err.stack)
    res.status(500).send(err.msg)
  }
}
