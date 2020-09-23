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
import * as mongodb from 'mongodb'
import { getEmail } from './getEmail'
import { getImportStatus, importPST } from './importPST'

const getWordCloud = async (): Promise<Array<WordCloudTag>> => {
  try {
    const client = await mongodb.MongoClient.connect(process.env.MONGODB_HOST, {
      useUnifiedTopology: false,
    })
    const db = client.db(dbName)
    const wordCloud = await db.collection(wordCloudCollection).find().toArray()
    return wordCloud.map((word) => ({ tag: word.tag, weight: word.weight }))
  } catch (err) {
    console.error(err.stack)
  }
}

const getEmailSentByDay = async (): Promise<Array<EmailSentByDay>> => {
  try {
    const client = await mongodb.MongoClient.connect(process.env.MONGODB_HOST, {
      useUnifiedTopology: false,
    })
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
    const client = await mongodb.MongoClient.connect(process.env.MONGODB_HOST, {
      useUnifiedTopology: false,
    })
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
    console.log('set custo color')
    const client = await mongodb.MongoClient.connect(process.env.MONGODB_HOST, {
      useUnifiedTopology: false,
    })
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
