import { dbName, emailCollection } from '@klonzo/common'
import * as dotenv from 'dotenv'
import { Request, Response } from 'express'
import { Pool } from 'pg'
dotenv.config()

// HTTP GET /email/<id>
export async function getSpecificEmail(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const pool = new Pool({ database: dbName })
    const result = await pool.query(
      `select * from ${emailCollection} where email_id = '${req.params.id}'`
    )
    const email = result.rows[0]
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
