import { dbName, wordCloudCollection } from '@klonzo/common'
import { Request, Response } from 'express'
import mysql, { ConnectionConfig } from 'mysql2/promise'

// HTTP GET /wordcloud
export async function getWordCloud(req: Request, res: Response): Promise<void> {
  try {
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_ROOT_PASSWORD,
      database: dbName,
    } as ConnectionConfig)
    const [rows] = await connection.execute(
      `select * from ${wordCloudCollection}`
    )
    res.json(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      rows.map((word) => ({
        tag: word.tag,
        weight: word.weight,
      }))
    )
  } catch (err) {
    console.error(err.stack)
    res.status(500).send(err.msg)
  }
}
