import { dbName, emailSentByDayCollection } from '@klonzo/common'
import { Request, Response } from 'express'
import sql from 'mssql'

// HTTP GET /emailsent
export async function getEmailSentByDay(
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
      `select * from ${emailSentByDayCollection} order by day_sent asc`
    )
    res.json(
      result.recordset.map((day) => ({
        sent: day.day_sent,
        emailIds: day.email_ids.split(','),
      }))
    )
  } catch (err) {
    console.error(err.stack)
    res.status(500).send(err.msg)
  }
}
