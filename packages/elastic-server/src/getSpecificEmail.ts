import { Client } from '@elastic/elasticsearch'
import { dbName, Email, elasticServer } from '@klonzo/common'
import { Request, Response } from 'express'

// HTTP GET /email/<id>
export async function getSpecificEmail(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const client = new Client({ node: elasticServer })

    const { body } = await client.search({
      index: dbName,
      q: `id:${req.params.id}`,
    })

    let email = {}
    if (body.hits.hits && body.hits.hits.length) {
      const hit = body.hits.hits[0]._source
      if (hit.id === req.params.id) email = hit
    }

    res.json(email)
  } catch (err) {
    console.error(err.stack)
    res.status(500).send(err.msg)
  }
}
