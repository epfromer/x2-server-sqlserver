import { dbName, emailSentByDayCollection } from '@klonzo/common'
import * as dotenv from 'dotenv'
import { Request, Response } from 'express'
import { Pool } from 'pg'
dotenv.config()

// HTTP GET /emailsent
export async function getEmailSentByDay(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const pool = new Pool({ database: dbName })
    const result = await pool.query(
      `select * from ${emailSentByDayCollection} order by day_sent asc`
    )
    res.json(
      result.rows.map((day) => ({
        sent: day.day_sent,
        emailIds: day.email_ids.split(','),
      }))
    )
  } catch (err) {
    console.error(err.stack)
    res.status(500).send(err.msg)
  }
}
