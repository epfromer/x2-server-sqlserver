import { dbName, emailCollection } from '@klonzo/common'
import * as dotenv from 'dotenv'
import { Request, Response } from 'express'
dotenv.config()

// http://knexjs.org/#Builder

// eslint-disable-next-line @typescript-eslint/no-var-requires
const knex = require('knex')({
  client: 'mysql2',
  connection: {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_ROOT_PASSWORD,
    database: dbName,
  },
})

// HTTP GET /email/<id>
export async function getSpecificEmail(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const email = await knex(emailCollection).where(
      'email_id',
      '=',
      req.params.id
    )
    res.json({
      id: email[0].email_id,
      sent: email[0].email_sent,
      sentShort: new Date(email[0].email_sent).toISOString().slice(0, 10),
      from: email[0].email_from,
      fromCustodian: email[0].email_from_custodian,
      to: email[0].email_to,
      toCustodians: email[0].email_to_custodians
        ? email[0].email_to_custodians.split(',')
        : [],
      cc: email[0].email_cc,
      bcc: email[0].email_bcc,
      subject: email[0].email_subject,
      body: email[0].email_body,
    })
  } catch (err) {
    console.error(err.stack)
    res.status(404).send(err.msg)
  }
}
