import { dbName, emailCollection } from '@klonzo/common'
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

// HTTP GET /email/<id>
export async function getSpecificEmail(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const docArr = await ftGetAsync([dbName + emailCollection, req.params.id])

    if (docArr.length) {
      // 'document' is returned as array of name followed by value entries
      // and they can be in any order, so need to convert to Object
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const doc: any = {}
      for (let j = 0; j < docArr.length; j = j + 2) {
        doc[docArr[j]] = docArr[j + 1]
      }

      res.json({
        id: req.params.id,
        sent: new Date(doc.sentStr),
        sentShort: new Date(doc.sentStr).toISOString().slice(0, 10),
        from: doc.from,
        fromCustodian: doc.fromCustodian,
        to: doc.emailto,
        toCustodians: doc.toCustodians ? doc.toCustodians.split(',') : [],
        cc: doc.cc,
        bcc: doc.bcc,
        subject: doc.subject,
        body: doc.body,
      })
    } else {
      // TODO - all db's should check for no email found
      res.status(404).send('no email found for id ' + req.params.id)
    }
  } catch (err) {
    console.error(err.stack)
    res.status(404).send(err.msg)
  }
}
