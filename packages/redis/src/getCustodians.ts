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

// HTTP GET /custodians
export async function getCustodians(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const docArr = await ftGetAsync([
      dbName + custodianCollection,
      'custodians',
    ])
    res.json(JSON.parse(docArr[1]))
  } catch (err) {
    console.error(err.stack)
    res.status(500).send(err.msg)
  }
}
