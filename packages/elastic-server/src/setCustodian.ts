import { Client } from '@elastic/elasticsearch'
import { custodianCollection, dbName, elasticServer } from '@klonzo/common'
import { Request, Response } from 'express'

// HTTP PUT /custodians/:id
export async function setCustodian(req: Request, res: Response): Promise<void> {
  try {
    const client = new Client({ node: elasticServer })
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
