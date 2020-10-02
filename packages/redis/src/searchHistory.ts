import {
  dbName,
  searchHistoryCollection,
  SearchHistoryEntry,
} from '@klonzo/common'
import redis from 'redis'
import { promisify } from 'util'

const client = redis.createClient()
const ftCreateAsync = promisify(client.ft_create).bind(client)
const ftDropAsync = promisify(client.ft_drop).bind(client)
const ftSearchAsync = promisify(client.ft_search).bind(client)

export async function getSearchHistory(): Promise<Array<SearchHistoryEntry>> {
  try {
    const historyArr = await ftSearchAsync([
      dbName + searchHistoryCollection,
      '*',
      'SORTBY',
      'timestamp',
      'desc',
    ])

    const entries = []
    // Redis response is array of name followed by value, so need to do some funky
    // assignments to get it into Object
    let i = 1
    while (i < historyArr.length) {
      const id = historyArr[i]
      const docArr = historyArr[i + 1]
      i = i + 2
      // 'document' is returned as array of name followed by value entries
      // and they can be in any order, so need to convert to Object
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const doc: any = {}
      if (!docArr) console.log(id, docArr)
      for (let j = 0; j < docArr.length; j = j + 2) {
        doc[docArr[j]] = docArr[j + 1]
      }
      entries.push({
        id,
        timestamp: doc.timestamp,
        entry: doc.entry,
      })
    }
    return entries
  } catch (err) {
    console.error(err.stack)
  }
}

export async function clearSearchHistory(): Promise<string> {
  try {
    await ftDropAsync([dbName + searchHistoryCollection])
    await ftCreateAsync([
      dbName + searchHistoryCollection,
      'SCHEMA',
      'timestamp',
      'TEXT',
      'SORTABLE',
      'entry',
      'TEXT',
    ])
    return `Search history cleared`
  } catch (err) {
    console.error(err.stack)
  }
}
