import { Client } from '@elastic/elasticsearch'
import { dbName, defaultLimit, elasticServer } from '@klonzo/common'
import { Request, Response } from 'express'

// HTTP GET /email/<id>
export async function getSpecificEmail(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const client = new Client({ node: elasticServer })

    // const { body } = await client.search({
    //   index: dbName,
    //   from: req.query.skip ? +req.query.skip : 0,
    //   q: createSearchParams(req.query),
    //   size: req.query.limit ? +req.query.limit : defaultLimit,
    //   sort: createSortOrder(req.query),
    // })

    console.log(req.params.id)

    const doc = {}
    res.json(doc)
  } catch (err) {
    console.error(err.stack)
    res.status(500).send(err.msg)
  }
}
