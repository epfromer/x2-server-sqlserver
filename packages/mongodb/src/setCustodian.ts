import { custodianCollection, dbName } from '@klonzo/common'
import { Request, Response } from 'express'
import * as mongodb from 'mongodb'

// HTTP PUT /custodians/:id
export async function setCustodian(req: Request, res: Response): Promise<void> {
  try {
    const client = await mongodb.MongoClient.connect(process.env.MONGODB_HOST, {
      useUnifiedTopology: false,
    })
    const db = client.db(dbName)
    await db
      .collection(custodianCollection)
      .findOneAndUpdate({ id: req.params.id }, { $set: req.body })
    res.status(200).send('success')
  } catch (err) {
    console.error(err.stack)
    res.status(500).send(err.msg)
  }
}
