import { custodianCollection, dbName } from '@klonzo/common'
import { Request, Response } from 'express'
import mysql, { ConnectionConfig } from 'mysql2/promise'

// HTTP GET /custodians
export async function getCustodians(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_ROOT_PASSWORD,
      database: dbName,
    } as ConnectionConfig)
    const [rows] = await connection.execute(
      `select * from ${custodianCollection} order by custodian_id asc`
    )
    res.json(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      rows.map((custodian) => ({
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
