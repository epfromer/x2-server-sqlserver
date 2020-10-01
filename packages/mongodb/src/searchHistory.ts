import {
  dbName,
  searchHistoryCollection,
  SearchHistoryEntry,
} from '@klonzo/common'
import * as mongodb from 'mongodb'

export async function getSearchHistory(): Promise<Array<SearchHistoryEntry>> {
  try {
    const client = await mongodb.MongoClient.connect(process.env.MONGODB_HOST, {
      useUnifiedTopology: false,
    })
    const db = client.db(dbName)
    const entries = await db
      .collection(searchHistoryCollection)
      .find()
      .sort({ timestamp: -1 })
      .toArray()
    return entries.map((entry) => ({
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
    const client = await mongodb.MongoClient.connect(process.env.MONGODB_HOST, {
      useUnifiedTopology: false,
    })
    const db = client.db(dbName)
    await db.dropCollection(searchHistoryCollection)
    return `Search history cleared`
  } catch (err) {
    console.error(err.stack)
  }
}
