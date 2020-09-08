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
import { v4 as uuidv4 } from 'uuid'
import * as dotenv from 'dotenv'
dotenv.config()

import { Client } from 'pg'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const knex = require('knex')

const client = new Client()
let db

const insertEmails = async (emails: Email[]): Promise<void> => {
  emails.forEach(async (email) => {
    await db(emailCollection).insert({
      id: uuidv4(),
      sent: email.sent,
      sentShort: email.sentShort,
      from: email.from,
      fromCustodian: email.fromCustodian,
      to: email.to,
      toCustodians: email.toCustodians.toString(),
      cc: email.cc,
      bcc: email.bcc,
      subject: email.subject,
      body: email.body,
    })
  })
}

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
  console.log(`connect to postgres`)
  await client.connect()

  console.log(`drop database`)
  await client.query('drop database if exists ' + dbName)

  console.log(`create database`)
  await client.query('create database ' + dbName)

  db = knex({
    client: 'pg',
    connection: {
      host: process.env.PGHOST,
      password: process.env.PGPASSWORD,
      database: dbName,
    },
  })
  await db.schema.createTable(emailCollection, (table) => {
    table.string('id').primary()
    table.datetime('sent')
    table.date('sentShort')
    table.text('from')
    table.text('fromCustodian')
    table.text('to')
    table.text('toCustodians')
    table.text('cc')
    table.text('bcc')
    table.text('subject')
    table.text('body')
  })

  // const res = await db(emailCollection).select('*')
  // console.log(res)

  console.log(`insert emails`)
  const numEmails = await walkFSfolder(insertEmails)

  // console.log(`insert word cloud`)
  // await processWordCloud(insertWordCloud)

  // console.log(`insert email sent`)
  // await processEmailSentByDay(insertEmailSentByDay)

  // console.log(`insert custodians`)
  // await processCustodians(insertCustodians)

  // console.log(`create index`)
  // await db.collection(emailCollection).createIndex({ '$**': 'text' })

  console.log(`completed ${numEmails} emails`)
  client.end()
}

run().catch(console.error)
