import { Client } from '@elastic/elasticsearch'
import { custodianCollection, dbName } from '@klonzo/common'
import * as dotenv from 'dotenv'
import { Request, Response } from 'express'
dotenv.config()

// HTTP PUT /custodians/:id
export async function setCustodian(req: Request, res: Response): Promise<void> {
  try {
    const client = new Client({
      node: `http://${process.env.ELASTIC_HOST}:${process.env.ELASTIC_PORT}`,
    })

    await client.update({
      index: dbName + custodianCollection,
      id: req.params.id,
      body: {
        doc: {
          color: req.body.color,
        },
      },
    })
    await client.indices.refresh({ index: dbName + custodianCollection })
    res.status(200).send('success')
  } catch (err) {
    console.error(err.stack)
    res.status(500).send(err.msg)
  }
}
