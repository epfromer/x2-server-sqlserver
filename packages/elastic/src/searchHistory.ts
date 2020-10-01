import {
  dbName,
  searchHistoryCollection,
  SearchHistoryEntry,
} from '@klonzo/common'
import { Client } from '@elastic/elasticsearch'

export async function getSearchHistory(): Promise<Array<SearchHistoryEntry>> {
  try {
    const client = new Client({
      node: `http://${process.env.ELASTIC_HOST}:${process.env.ELASTIC_PORT}`,
    })
    const { body } = await client.search({
      index: dbName + searchHistoryCollection,
      q: '*',
      sort: 'timestamp.keyword:asc',
    })
    return body.hits.hits.map((entry) => ({
      id: entry.id,
      timestamp: entry.timestamp,
      entry: entry.entry,
    }))
  } catch (err) {
    console.error(err.stack)
  }
}

export async function clearSearchHistory(): Promise<string> {
  try {
    const client = new Client({
      node: `http://${process.env.ELASTIC_HOST}:${process.env.ELASTIC_PORT}`,
    })
    // const db = client.db(dbName)
    // await db.dropCollection(searchHistoryCollection)
    return `Search history cleared`
  } catch (err) {
    console.error(err.stack)
  }
}
