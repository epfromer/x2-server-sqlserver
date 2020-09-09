import {
  dbName,
  Email,
  emailCollection,
  processWordCloud,
  walkFSfolder,
  wordCloudCollection,
  WordCloudTag,
} from '@klonzo/common'
import * as dotenv from 'dotenv'
import { Client } from 'pg'
import { v4 as uuidv4 } from 'uuid'
dotenv.config()

const client = new Client()

// eslint-disable-next-line @typescript-eslint/no-var-requires
const knex = require('knex')
let db

const insertEmails = async (emails: Email[]): Promise<void> => {
  emails.forEach(async (email) => {
    await db(emailCollection).insert({
      email_id: uuidv4(),
      email_sent: email.sent,
      email_from: email.from,
      email_from_lc: email.from.toLowerCase(), // lower case of text fields for faster search
      email_from_custodian: email.fromCustodian,
      email_from_custodian_lc: email.fromCustodian.toLowerCase(),
      email_to: email.to,
      email_to_lc: email.to.toLowerCase(),
      email_to_custodians: email.toCustodians.toString(),
      email_to_custodians_lc: email.toCustodians.toString().toLowerCase(),
      email_cc: email.cc,
      email_cc_lc: email.cc.toLowerCase(),
      email_bcc: email.bcc,
      email_bcc_lc: email.bcc.toLowerCase(),
      email_subject: email.subject,
      email_subject_lc: email.subject.toLowerCase(),
      email_body: email.body,
      email_body_lc: email.body.toLowerCase(),
    })
  })
}

const insertWordCloud = async (wordCloud: WordCloudTag[]): Promise<void> => {
  wordCloud.forEach(async (word) => {
    await db(wordCloudCollection).insert({
      tag: word.tag,
      weight: word.weight,
    })
  })
}

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
  client.end()

  db = knex({
    client: 'pg',
    connection: {
      host: process.env.PGHOST,
      password: process.env.PGPASSWORD,
      database: dbName,
    },
  })
  await db.schema.createTable(emailCollection, (table) => {
    table.string('email_id').primary()
    table.datetime('email_sent')
    table.text('email_from')
    table.text('email_from_lc') // lower case of text fields for faster search
    table.text('email_from_custodian')
    table.text('email_from_custodian_lc')
    table.text('email_to')
    table.text('email_to_lc')
    table.text('email_to_custodians')
    table.text('email_to_custodians_lc')
    table.text('email_cc')
    table.text('email_cc_lc')
    table.text('email_bcc')
    table.text('email_bcc_lc')
    table.text('email_subject')
    table.text('email_subject_lc')
    table.text('email_body')
    table.text('email_body_lc')
  })
  await db.schema.createTable(wordCloudCollection, (table) => {
    table.string('tag').primary()
    table.decimal('weight')
  })

  console.log(`insert emails`)
  const numEmails = await walkFSfolder(insertEmails)

  console.log(`insert word cloud`)
  await processWordCloud(insertWordCloud)

  // console.log(`insert email sent`)
  // await processEmailSentByDay(insertEmailSentByDay)

  // console.log(`insert custodians`)
  // await processCustodians(insertCustodians)

  console.log(`completed ${numEmails} emails`)
}

run().catch(console.error)
