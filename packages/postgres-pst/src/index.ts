import {
  Custodian,
  custodianCollection,
  dbName,
  Email,
  emailCollection,
  EmailSentByDay,
  emailSentByDayCollection,
  mongodbServer,
  processCustodians,
  processEmailSentByDay,
  processWordCloud,
  walkFSfolder,
  wordCloudCollection,
  WordCloudTag,
} from '@klonzo/common'
import * as dotenv from 'dotenv'
import { Client } from 'pg'

// const insertEmails = async (email: Email[]): Promise<void> => {
//   await db.collection(emailCollection).insertMany(email)
// }

// const insertWordCloud = async (wordCloud: WordCloudTag[]): Promise<void> => {
//   await db.collection(wordCloudCollection).insertMany(wordCloud)
// }

// const insertEmailSentByDay = async (
//   emailSentByDay: EmailSentByDay[]
// ): Promise<void> => {
//   await db.collection(emailSentByDayCollection).insertMany(emailSentByDay)
// }

// const insertCustodians = async (Custodians: Custodian[]): Promise<void> => {
//   await db.collection(custodianCollection).insertMany(Custodians)
// }

async function run() {
  dotenv.config()

  console.log(`connect to postgres`)
  const client = new Client()

  console.log(`drop database`)
  try {
    await client.connect()
    await client.query('drop database ' + dbName)
  } catch (err) {
    console.log(err)
  }

  console.log(`create database`)
  await client.query('create database ' + dbName)

  // https://www.npmjs.com/package/knex

  // console.log(`insert emails`)
  // const numEmails = await walkFSfolder(insertEmails)

  const result = await client.query('SELECT now()')
  console.log(result)

  // console.log(`insert word cloud`)
  // await processWordCloud(insertWordCloud)

  // console.log(`insert email sent`)
  // await processEmailSentByDay(insertEmailSentByDay)

  // console.log(`insert custodians`)
  // await processCustodians(insertCustodians)

  // console.log(`create index`)
  // await db.collection(emailCollection).createIndex({ '$**': 'text' })

  // console.log(`completed ${numEmails} emails`)
  client.end()
}

run().catch(console.error)
