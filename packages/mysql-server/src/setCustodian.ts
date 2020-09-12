import { custodianCollection, dbName } from '@klonzo/common'
import * as dotenv from 'dotenv'
import { Request, Response } from 'express'
import redis from 'redis'
import redisearch from 'redis-redisearch'
import { promisify } from 'util'

redisearch(redis)
dotenv.config()

// https://oss.redislabs.com/redisearch/Commands.html#ftget
const client = redis.createClient()
const ftGetAsync = promisify(client.ft_get).bind(client)
const ftAddAsync = promisify(client.ft_add).bind(client)

// HTTP PUT /custodians/:id
export async function setCustodian(req: Request, res: Response): Promise<void> {
  try {
    const docArr = await ftGetAsync([
      dbName + custodianCollection,
      'custodians',
    ])
    const custodians = JSON.parse(docArr[1]).map((custodian) => {
      if (custodian.id === req.params.id) custodian.color = req.body.color
      return custodian
    })
    await ftAddAsync([
      dbName + custodianCollection,
      'custodians',
      1.0,
      'REPLACE',
      'FIELDS',
      'custodians',
      JSON.stringify(custodians),
    ])
    res.status(200).send('success')
  } catch (err) {
    console.error(err.stack)
    res.status(500).send(err.msg)
  }
}
