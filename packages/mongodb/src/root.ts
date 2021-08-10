import {
  Custodian,
  custodianCollection,
  dbName,
  EmailSentByDay,
  emailSentByDayCollection,
  EmailTotal,
  HTTPQuery,
  ImportLogEntry,
  SearchHistoryEntry,
  wordCloudCollection,
  WordCloudTag,
} from '@klonzo/common'
import * as mongodb from 'mongodb'
import { getEmail } from './getEmail'
import { getImportStatus, importPST } from './importPST'
import { clearSearchHistory, getSearchHistory } from './searchHistory'

const getWordCloud = async (): Promise<Array<WordCloudTag>> => {
  try {
    const client = await mongodb.MongoClient.connect(process.env.MONGODB_HOST)
    const db = client.db(dbName)
    const wordCloud = await db.collection(wordCloudCollection).find().toArray()
    return wordCloud.map((word) => ({ tag: word.tag, weight: word.weight }))
  } catch (err) {
    console.error(err.stack)
  }
}

const getEmailSentByDay = async (): Promise<Array<EmailSentByDay>> => {
  try {
    const client = await mongodb.MongoClient.connect(process.env.MONGODB_HOST)
    const db = client.db(dbName)
    const emailSentByDay = await db
      .collection(emailSentByDayCollection)
      .find()
      .sort({ sent: 1 })
      .toArray()
    return emailSentByDay.map((day) => ({ sent: day.sent, total: day.total }))
  } catch (err) {
    console.error(err.stack)
  }
}

const getCustodians = async (): Promise<Array<Custodian>> => {
  try {
    const client = await mongodb.MongoClient.connect(process.env.MONGODB_HOST)
    const db = client.db(dbName)
    const custodians = await db.collection(custodianCollection).find().toArray()
    return custodians.map((custodian) => ({
      id: custodian.id,
      name: custodian.name,
      title: custodian.title,
      color: custodian.color,
      senderTotal: custodian.senderTotal,
      receiverTotal: custodian.receiverTotal,
      toCustodians: custodian.toCustodians,
    }))
  } catch (err) {
    console.error(err.stack)
  }
}

const setCustodianColor = async (
  httpQuery: HTTPQuery
): Promise<Array<Custodian>> => {
  try {
    const client = await mongodb.MongoClient.connect(process.env.MONGODB_HOST)
    const db = client.db(dbName)
    await db
      .collection(custodianCollection)
      .findOneAndUpdate(
        { id: httpQuery.id },
        { $set: { color: httpQuery.color } }
      )
    const custodians = await db.collection(custodianCollection).find().toArray()
    return custodians.map((custodian) => ({
      id: custodian.id,
      name: custodian.name,
      title: custodian.title,
      color: custodian.color,
      senderTotal: custodian.senderTotal,
      receiverTotal: custodian.receiverTotal,
      toCustodians: custodian.toCustodians,
    }))
  } catch (err) {
    console.error(err.stack)
  }
}

interface Root {
  clearSearchHistory: () => Promise<string>
  getCustodians: () => Promise<Array<Custodian>>
  getEmail: (httpQuery: HTTPQuery) => Promise<EmailTotal>
  getEmailSentByDay: () => Promise<Array<EmailSentByDay>>
  getImportStatus: () => Array<ImportLogEntry>
  getSearchHistory: () => Promise<Array<SearchHistoryEntry>>
  getWordCloud: () => Promise<Array<WordCloudTag>>
  importPST: (httpQuery) => string
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
