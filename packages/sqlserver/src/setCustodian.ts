import { custodianCollection, dbName } from '@klonzo/common'
import { Request, Response } from 'express'
import sql from 'mssql'

// HTTP PUT /custodians/:id
export async function setCustodian(req: Request, res: Response): Promise<void> {
  try {
    const pool = await sql.connect({
      server: process.env.SQL_HOST,
      user: process.env.SQL_USER,
      password: process.env.SQL_PASSWORD,
      database: dbName,
    })
    await pool.query(
      `update ${custodianCollection} set color = '${req.body.color}' where custodian_id = '${req.params.id}'`
    )
    res.status(200).send('success')
  } catch (err) {
    console.error(err.stack)
    res.status(500).send(err.msg)
  }
}
