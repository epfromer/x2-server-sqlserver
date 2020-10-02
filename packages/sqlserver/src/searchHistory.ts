import {
  dbName,
  searchHistoryCollection,
  SearchHistoryEntry,
} from '@klonzo/common'
import { Pool } from 'pg'

export async function getSearchHistory(): Promise<Array<SearchHistoryEntry>> {
  try {
    const pool = new Pool({ database: dbName })
    const result = await pool.query(
      `select * from ${searchHistoryCollection} order by time_stamp desc`
    )
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return result.rows.map((entry) => ({
      id: entry.history_id,
      timestamp: entry.time_stamp,
      entry: entry.entry,
    }))
  } catch (err) {
    console.error(err.stack)
  }
}

export async function clearSearchHistory(): Promise<string> {
  try {
    const pool = new Pool({ database: dbName })
    await pool.query(`truncate table ${searchHistoryCollection}`)
    return `Search history cleared`
  } catch (err) {
    console.error(err.stack)
  }
}
