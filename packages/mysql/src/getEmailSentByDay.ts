import { dbName, emailSentByDayCollection } from '@klonzo/common'
import * as dotenv from 'dotenv'
import mysql from 'mysql2/promise'
import { Request, Response } from 'express'
dotenv.config()


// HTTP GET /emailsent
export async function getEmailSentByDay(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_ROOT_PASSWORD,
      database: dbName,
    })
    const [rows] = await connection.execute(
      `select * from ${emailSentByDayCollection} order by day_sent asc`
    )
    res.json(
      rows.map((day) => ({
        sent: day.day_sent,
        emailIds: day.email_ids.split(','),
      }))
    )
  } catch (err) {
    console.error(err.stack)
    res.status(500).send(err.msg)
  }
}
