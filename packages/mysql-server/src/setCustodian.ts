import { custodianCollection, dbName } from '@klonzo/common'
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

// HTTP PUT /custodians/:id
export async function setCustodian(req: Request, res: Response): Promise<void> {
  try {
    await knex(custodianCollection)
      .where('custodian_id', '=', req.params.id)
      .update({ color: req.body.color })
    res.status(200).send('success')
  } catch (err) {
    console.error(err.stack)
    res.status(500).send(err.msg)
  }
}
