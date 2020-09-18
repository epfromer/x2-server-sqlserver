import { dbName, wordCloudCollection } from '@klonzo/common'
import { Request, Response } from 'express'
import { Pool } from 'pg'

// HTTP GET /wordcloud
export async function getWordCloud(req: Request, res: Response): Promise<void> {
  try {
    const pool = new Pool({ database: dbName })
    const result = await pool.query(`select * from ${wordCloudCollection}`)
    res.json(
      result.rows.map((word) => ({
        tag: word.tag,
        weight: word.weight,
      }))
    )
  } catch (err) {
    console.error(err.stack)
    res.status(500).send(err.msg)
  }
}
