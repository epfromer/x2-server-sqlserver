import {
  getSQLConnection,
  searchHistoryCollection,
  SearchHistoryEntry,
} from './common'

export async function getSearchHistory(): Promise<Array<SearchHistoryEntry>> {
  const pool = await getSQLConnection()
  if (!pool) {
    console.error('no pool from connect')
    return []
  }
  const result = await pool.query(
    `select * from ${searchHistoryCollection} order by time_stamp desc`
  )
  return result.recordset.map((entry) => ({
    id: entry.history_id,
    timestamp: entry.time_stamp,
    entry: entry.entry,
  }))
}

export async function clearSearchHistory(): Promise<string> {
  const pool = await getSQLConnection()
  if (!pool) {
    console.error('no pool from connect')
    return ''
  }
  await pool.query(`truncate table ${searchHistoryCollection}`)
  return `Search history cleared`
}
