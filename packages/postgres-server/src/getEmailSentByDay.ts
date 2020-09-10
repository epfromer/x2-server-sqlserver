import { dbName, emailSentByDayCollection } from '@klonzo/common'
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

// HTTP GET /emailsent
export async function getEmailSentByDay(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const emailSentByDay = await knex(emailSentByDayCollection).orderBy(
      'day_sent',
      'asc'
    )
    res.json(
      emailSentByDay.map((day) => ({
        sent: day.day_sent,
        emailIds: day.emailIds.split(','),
      }))
    )
  } catch (err) {
    console.error(err.stack)
    res.status(500).send(err.msg)
  }
}
