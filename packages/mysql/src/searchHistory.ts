import {
  dbName,
  searchHistoryCollection,
  SearchHistoryEntry,
} from '@klonzo/common'
import mysql from 'mysql2/promise'
import { Client } from '@elastic/elasticsearch'

export async function getSearchHistory(): Promise<Array<SearchHistoryEntry>> {
  try {
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_ROOT_PASSWORD,
      database: dbName,
    })
    const [rows] = await connection.execute(
      `select * from ${searchHistoryCollection} order by time_stamp desc`
    )
    connection.end()
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return rows.map((entry) => ({
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
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_ROOT_PASSWORD,
      database: dbName,
    })
    await connection.execute(`truncate table ${searchHistoryCollection}`)
    connection.end()
    return `Search history cleared`
  } catch (err) {
    console.error(err.stack)
  }
}
