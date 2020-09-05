import { custodianCollection } from '@klonzo/common'
import { Request, Response } from 'express'
import { db } from './index'

// HTTP GET /custodians
export async function getCustodians(
  req: Request,
  res: Response
): Promise<void> {
  try {
    let custodians = await db.collection(custodianCollection).find().toArray()
    custodians = custodians.map((custodian) => ({
      id: custodian.id,
      name: custodian.name,
      aliases: custodian.aliases,
      title: custodian.title,
      color: custodian.color,
      senderTotal: custodian.senderTotal,
      receiverTotal: custodian.receiverTotal,
      toCustodians: custodian.toCustodians,
      fromCustodians: custodian.fromCustodians,
    }))
    res.json(custodians)
  } catch (err) {
    console.error(err.stack)
    res.status(500).send(err.msg)
  }
}
