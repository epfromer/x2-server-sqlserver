import { custodianCollection } from '@klonzo/common'
import { Request, Response } from 'express'

// HTTP GET /custodians
export async function getCustodians(
  req: Request,
  res: Response
): Promise<void> {
  try {
    // const custodians = await db.collection(custodianCollection).find().toArray()
    // res.json(
    //   custodians.map((custodian) => ({
    //     id: custodian.id,
    //     name: custodian.name,
    //     aliases: custodian.aliases,
    //     title: custodian.title,
    //     color: custodian.color,
    //     senderTotal: custodian.senderTotal,
    //     receiverTotal: custodian.receiverTotal,
    //     toCustodians: custodian.toCustodians,
    //     fromCustodians: custodian.fromCustodians,
    //   }))
    // )
  } catch (err) {
    console.error(err.stack)
    res.status(500).send(err.msg)
  }
}
