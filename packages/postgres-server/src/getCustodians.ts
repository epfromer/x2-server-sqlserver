import { custodianCollection, dbName } from '@klonzo/common'
import * as dotenv from 'dotenv'
import { Request, Response } from 'express'
dotenv.config()

// http://knexjs.org/#Builder

// eslint-disable-next-line @typescript-eslint/no-var-requires
const knex = require('knex')({
  client: 'pg',
  connection: {
    host: process.env.PGHOST,
    password: process.env.PGPASSWORD,
    database: dbName,
  },
})

// HTTP GET /custodians
export async function getCustodians(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const custodians = await knex(custodianCollection).orderBy(
      'custodian_id ',
      'asc'
    )
    res.json(
      custodians.map((custodian) => ({
        id: custodian.custodian_id,
        name: custodian.custodian_name,
        title: custodian.title,
        color: custodian.color,
        senderTotal: custodian.sender_total,
        receiverTotal: custodian.receiver_total,
        toCustodians: JSON.parse(custodian.to_custodians),
        fromCustodians: JSON.parse(custodian.from_custodians),
      }))
    )
  } catch (err) {
    console.error(err.stack)
    res.status(500).send(err.msg)
  }
}