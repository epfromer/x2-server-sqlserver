import {
  Custodian,
  custodianCollection,
  EmailSentByDay,
  emailSentByDayCollection,
  EmailTotal,
  getSQLConnection,
  HTTPQuery,
  ImportLogEntry,
  SearchHistoryEntry,
  wordCloudCollection,
  WordCloudTag,
} from './common'
import { getEmail } from './getEmail'
import { getImportStatus, importPST } from './importPST'
import { clearSearchHistory, getSearchHistory } from './searchHistory'

const getWordCloud = async (): Promise<Array<WordCloudTag>> => {
  const pool = await getSQLConnection()
  if (!pool) {
    console.error('no pool from connect')
    return []
  }
  const result = await pool.query(`select * from ${wordCloudCollection}`)
  return result.recordset
}

const getEmailSentByDay = async (): Promise<Array<EmailSentByDay>> => {
  const pool = await getSQLConnection()
  if (!pool) {
    console.error('no pool from connect')
    return []
  }
  const result = await pool.query(
    `select * from ${emailSentByDayCollection} order by day_sent asc`
  )
  return result.recordset.map((day) => ({
    sent: day.day_sent,
    total: day.total,
  }))
}

const getCustodians = async (): Promise<Array<Custodian>> => {
  const pool = await getSQLConnection()
  if (!pool) {
    console.error('no pool from connect')
    return []
  }
  const result = await pool.query(
    `select * from ${custodianCollection} order by custodian_id asc`
  )
  return result.recordset.map((custodian) => ({
    id: custodian.custodian_id,
    name: custodian.custodian_name,
    aliases: [],
    title: custodian.title,
    color: custodian.color,
    senderTotal: custodian.sender_total,
    receiverTotal: custodian.receiver_total,
    toCustodians: JSON.parse(custodian.to_custodians),
  }))
}

const setCustodianColor = async (
  httpQuery: HTTPQuery
): Promise<Array<Custodian>> => {
  const pool = await getSQLConnection()
  if (!pool) {
    console.error('no pool from connect')
    return []
  }
  await pool.query(
    `update ${custodianCollection} set color = '${httpQuery.color}' where custodian_id = '${httpQuery.id}'`
  )
  const result = await pool.query(
    `select * from ${custodianCollection} order by custodian_id asc`
  )
  return result.recordset.map((custodian) => ({
    id: custodian.custodian_id,
    name: custodian.custodian_name,
    aliases: [],
    title: custodian.title,
    color: custodian.color,
    senderTotal: custodian.sender_total,
    receiverTotal: custodian.receiver_total,
    toCustodians: JSON.parse(custodian.to_custodians),
  }))
}

interface Root {
  clearSearchHistory: () => Promise<string>
  getCustodians: () => Promise<Array<Custodian>>
  getEmail: (httpQuery: HTTPQuery) => Promise<EmailTotal>
  getEmailSentByDay: () => Promise<Array<EmailSentByDay>>
  getImportStatus: () => Array<ImportLogEntry>
  getSearchHistory: () => Promise<Array<SearchHistoryEntry>>
  getWordCloud: () => Promise<Array<WordCloudTag>>
  importPST: (httpQuery: HTTPQuery) => string
  setCustodianColor: (httpQuery: HTTPQuery) => Promise<Array<Custodian>>
}
export const root: Root = {
  clearSearchHistory: () => clearSearchHistory(),
  getCustodians: () => getCustodians(),
  getEmail: (httpQuery) => getEmail(httpQuery),
  getEmailSentByDay: () => getEmailSentByDay(),
  getImportStatus: () => getImportStatus(),
  getSearchHistory: () => getSearchHistory(),
  getWordCloud: () => getWordCloud(),
  importPST: (httpQuery) => importPST(httpQuery),
  setCustodianColor: (httpQuery) => setCustodianColor(httpQuery),
}

export default root
