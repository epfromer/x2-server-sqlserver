import { dbName, emailCollection } from '@klonzo/common'
import { Request, Response } from 'express'
import mysql, { ConnectionConfig } from 'mysql2/promise'

// HTTP GET /email/<id>
export async function getSpecificEmail(
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
      `select * from ${emailCollection} where email_id = '${req.params.id}'`
    )
    const email = rows[0]
    res.json({
      id: email.email_id,
      sent: email.email_sent,
      sentShort: new Date(email.email_sent).toISOString().slice(0, 10),
      from: email.email_from,
      fromCustodian: email.email_from_custodian,
      to: email.email_to,
      toCustodians: email.email_to_custodians
        ? email.email_to_custodians.split(',')
        : [],
      cc: email.email_cc,
      bcc: email.email_bcc,
      subject: email.email_subject,
      body: email.email_body,
    })
  } catch (err) {
    console.error(err.stack)
    res.status(404).send(err.msg)
  }
}
