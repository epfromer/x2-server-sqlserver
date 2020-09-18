import { custodianCollection, dbName } from '@klonzo/common'
import { Request, Response } from 'express'
import sql from 'mssql'

// HTTP GET /custodians
export async function getCustodians(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const pool = await sql.connect({
      server: process.env.SQL_HOST,
      user: process.env.SQL_USER,
      password: process.env.SQL_PASSWORD,
      database: dbName,
    })
    const result = await pool.query(
      `select * from ${custodianCollection} order by custodian_id asc`
    )
    res.json(
      result.recordset.map((custodian) => ({
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
