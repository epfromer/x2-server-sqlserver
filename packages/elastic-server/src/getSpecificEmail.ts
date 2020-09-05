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

    const email = {}
    if (body.hits.hits && body.hits.hits.length) {
      const hit = body.hits.hits[0]._source
      console.log(hit)
      console.log(hit.id, req.params.id)
      if (hit.id === req.params.id) {
        console.log('exact match')
      }
      //   let email: Email
      //   email.id = body.hits.hits[0]._source.id
      //   res.json(email)
      // } else {
      //   res.status(404).send('email not found')
    }

    res.json(email)
  } catch (err) {
    console.error(err.stack)
    res.status(500).send(err.msg)
  }
}
