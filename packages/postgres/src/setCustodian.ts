import { custodianCollection, dbName } from '@klonzo/common'
import * as dotenv from 'dotenv'
import { Request, Response } from 'express'
import { Pool } from 'pg'
dotenv.config()

// HTTP PUT /custodians/:id
export async function setCustodian(req: Request, res: Response): Promise<void> {
  try {
    const pool = new Pool({ database: dbName })
    await pool.query(
      `update ${custodianCollection} set color = '${req.body.color}' where custodian_id = '${req.params.id}'`
    )
    res.status(200).send('success')
  } catch (err) {
    console.error(err.stack)
    res.status(500).send(err.msg)
  }
}
