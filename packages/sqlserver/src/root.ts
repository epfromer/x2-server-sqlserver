import {
  Custodian,
  custodianCollection,
  dbName,
  EmailSentByDay,
  emailSentByDayCollection,
  EmailTotal,
  HTTPQuery,
  ImportLogEntry,
  wordCloudCollection,
  WordCloudTag,
} from '@klonzo/common'
import { getEmail } from './getEmail'
import sql from 'mssql'
import { getImportStatus, importPST } from './importPST'

const getWordCloud = async (): Promise<Array<WordCloudTag>> => {
  try {
    const pool = await sql.connect({
      server: process.env.SQL_HOST,
      user: process.env.SQL_USER,
      password: process.env.SQL_PASSWORD,
      database: dbName,
    })
    const result = await pool.query(`select * from ${wordCloudCollection}`)
    // await pool.close()
    return result.recordset
  } catch (err) {
    console.error(err.stack)
  }
}

const getEmailSentByDay = async (): Promise<Array<EmailSentByDay>> => {
  try {
    const pool = await sql.connect({
      server: process.env.SQL_HOST,
      user: process.env.SQL_USER,
      password: process.env.SQL_PASSWORD,
      database: dbName,
    })
    const result = await pool.query(
      `select * from ${emailSentByDayCollection} order by day_sent asc`
    )
    // await pool.close()
    return result.recordset.map((day) => ({
      sent: day.day_sent,
      emailIds: day.email_ids.split(','),
    }))
  } catch (err) {
    console.error(err.stack)
  }
}

const getCustodians = async (): Promise<Array<Custodian>> => {
  try {
    const pool = await sql.connect({
      server: process.env.SQL_HOST,
      user: process.env.SQL_USER,
      password: process.env.SQL_PASSWORD,
      database: dbName,
    })
    const result = await pool.query(
      `select * from ${custodianCollection} order by custodian_id asc`
    )
    // await pool.close()
    return result.rows.map((custodian) => ({
      id: custodian.custodian_id,
      name: custodian.custodian_name,
      title: custodian.title,
      color: custodian.color,
      senderTotal: custodian.sender_total,
      receiverTotal: custodian.receiver_total,
      toCustodians: JSON.parse(custodian.to_custodians),
      fromCustodians: JSON.parse(custodian.from_custodians),
    }))
  } catch (err) {
    console.error(err.stack)
  }
}

const setCustodianColor = async (
  httpQuery: HTTPQuery
): Promise<Array<Custodian>> => {
  const pool = await sql.connect({
    server: process.env.SQL_HOST,
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    database: dbName,
  })
  await pool.query(
    `update ${custodianCollection} set color = '${httpQuery.color}' where custodian_id = '${httpQuery.id}'`
  )
  const result = await pool.query(
    `select * from ${custodianCollection} order by custodian_id asc`
  )
  await pool.close()
  return result.rows.map((custodian) => ({
    id: custodian.custodian_id,
    name: custodian.custodian_name,
    title: custodian.title,
    color: custodian.color,
    senderTotal: custodian.sender_total,
    receiverTotal: custodian.receiver_total,
    toCustodians: JSON.parse(custodian.to_custodians),
    fromCustodians: JSON.parse(custodian.from_custodians),
  }))
}

interface Root {
  importPST: (httpQuery) => string
  getImportStatus: () => Array<ImportLogEntry>
  getWordCloud: () => Promise<Array<WordCloudTag>>
  getEmailSentByDay: () => Promise<Array<EmailSentByDay>>
  getCustodians: () => Promise<Array<Custodian>>
  getEmail: (httpQuery: HTTPQuery) => Promise<EmailTotal>
  setCustodianColor: (httpQuery: HTTPQuery) => Promise<Array<Custodian>>
}
export const root: Root = {
  importPST: (httpQuery) => importPST(httpQuery),
  getImportStatus: () => getImportStatus(),
  getWordCloud: () => getWordCloud(),
  getEmailSentByDay: () => getEmailSentByDay(),
  getCustodians: () => getCustodians(),
  getEmail: (httpQuery) => getEmail(httpQuery),
  setCustodianColor: (httpQuery) => setCustodianColor(httpQuery),
}

export default root
