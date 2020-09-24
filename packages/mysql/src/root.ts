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
import mysql from 'mysql2/promise'
import { getEmail } from './getEmail'
import { getImportStatus, importPST } from './importPST'

const getWordCloud = async (): Promise<Array<WordCloudTag>> => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_ROOT_PASSWORD,
      database: dbName,
    })
    const [rows] = await connection.execute(
      `select * from ${wordCloudCollection}`
    )
    connection.end()
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return rows.map((word) => ({
      tag: word.tag,
      weight: word.weight,
    }))
  } catch (err) {
    console.error(err.stack)
  }
}

const getEmailSentByDay = async (): Promise<Array<EmailSentByDay>> => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_ROOT_PASSWORD,
      database: dbName,
    })
    const [rows] = await connection.execute(
      `select * from ${emailSentByDayCollection} order by day_sent asc`
    )
    connection.end()
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return rows.map((day) => ({
      sent: day.day_sent,
      emailIds: day.total,
    }))
  } catch (err) {
    console.error(err.stack)
  }
}

const getCustodians = async (): Promise<Array<Custodian>> => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_ROOT_PASSWORD,
      database: dbName,
    })
    const [rows] = await connection.execute(
      `select * from ${custodianCollection} order by custodian_id asc`
    )
    connection.end()
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return rows.map((custodian) => ({
      id: custodian.custodian_id,
      name: custodian.custodian_name,
      title: custodian.title,
      color: custodian.color,
      senderTotal: custodian.sender_total,
      receiverTotal: custodian.receiver_total,
      toCustodians: JSON.parse(custodian.to_custodians),
    }))
  } catch (err) {
    console.error(err.stack)
  }
}

const setCustodianColor = async (
  httpQuery: HTTPQuery
): Promise<Array<Custodian>> => {
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_ROOT_PASSWORD,
    database: dbName,
  })
  await connection.execute(
    `update ${custodianCollection} set color = '${httpQuery.color}' where custodian_id = '${httpQuery.id}'`
  )
  const [rows] = await connection.execute(
    `select * from ${custodianCollection} order by custodian_id asc`
  )
  connection.end()
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return rows.map((custodian) => ({
    id: custodian.custodian_id,
    name: custodian.custodian_name,
    title: custodian.title,
    color: custodian.color,
    senderTotal: custodian.sender_total,
    receiverTotal: custodian.receiver_total,
    toCustodians: JSON.parse(custodian.to_custodians),
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
