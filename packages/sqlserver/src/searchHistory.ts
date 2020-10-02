import {
  dbName,
  searchHistoryCollection,
  SearchHistoryEntry,
} from '@klonzo/common'
import sql from 'mssql'

export async function getSearchHistory(): Promise<Array<SearchHistoryEntry>> {
  try {
    const pool = await sql.connect({
      server: process.env.SQL_HOST,
      user: process.env.SQL_USER,
      password: process.env.SQL_PASSWORD,
      database: dbName,
    })
    const result = await pool.query(
      `select * from ${searchHistoryCollection} order by time_stamp desc`
    )
    return result.recordset.map((entry) => ({
      id: entry.history_id,
      timestamp: entry.time_stamp,
      entry: entry.entry,
    }))
    return []
  } catch (err) {
    console.error(err.stack)
  }
}

export async function clearSearchHistory(): Promise<string> {
  try {
    const pool = await sql.connect({
      server: process.env.SQL_HOST,
      user: process.env.SQL_USER,
      password: process.env.SQL_PASSWORD,
      database: dbName,
    })
    await pool.query(`truncate table ${searchHistoryCollection}`)
    return `Search history cleared`
  } catch (err) {
    console.error(err.stack)
  }
}
