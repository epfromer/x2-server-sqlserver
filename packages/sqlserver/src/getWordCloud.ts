import { dbName, wordCloudCollection } from '@klonzo/common'
import * as dotenv from 'dotenv'
import { Request, Response } from 'express'
import sql from 'mssql'
dotenv.config()

// HTTP GET /wordcloud
export async function getWordCloud(req: Request, res: Response): Promise<void> {
  try {
    const pool = await sql.connect({
      server: process.env.SQL_HOST,
      user: process.env.SQL_USER,
      password: process.env.SQL_PASSWORD,
      database: dbName,
    })
    const result = await pool.query(`select * from ${wordCloudCollection}`)
    res.json(result.recordset)
  } catch (err) {
    console.error(err.stack)
    res.status(500).send(err.msg)
  }
}
