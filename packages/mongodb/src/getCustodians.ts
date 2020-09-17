import { custodianCollection, dbName } from '@klonzo/common'
import * as dotenv from 'dotenv'
import { Request, Response } from 'express'
import * as mongodb from 'mongodb'
dotenv.config()

// HTTP GET /custodians
export async function getCustodians(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const client = await mongodb.MongoClient.connect(process.env.MONGODB_HOST, {
      useUnifiedTopology: false,
    })
    const db = client.db(dbName)
    const custodians = await db.collection(custodianCollection).find().toArray()
    res.json(
      custodians.map((custodian) => ({
        id: custodian.id,
        name: custodian.name,
        title: custodian.title,
        color: custodian.color,
        senderTotal: custodian.senderTotal,
        receiverTotal: custodian.receiverTotal,
        toCustodians: custodian.toCustodians,
        fromCustodians: custodian.fromCustodians,
      }))
    )
  } catch (err) {
    console.error(err.stack)
    res.status(500).send(err.msg)
  }
}
