import {
  Custodian,
  custodianCollection,
  dbName,
  Email,
  emailCollection,
  EmailSentByDay,
  emailSentByDayCollection,
  processCustodians,
  processEmailSentByDay,
  processWordCloud,
  walkFSfolder,
  wordCloudCollection,
  WordCloudTag,
} from '@klonzo/common'
import * as dotenv from 'dotenv'
import { v4 as uuidv4 } from 'uuid'
import sql from 'mssql'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const knex = require('knex')
dotenv.config()

async function run() {
  const insertEmails = async (emails: Email[]): Promise<void> => {
    emails.forEach(async (email) => {
      await db(emailCollection).insert({
        email_id: uuidv4(),
        email_sent: email.sent,
        email_from: email.from,
        email_from_sort: email.from.slice(0, 254),
        email_from_lc: email.from.toLowerCase(), // lower case of text fields for faster search
        email_from_custodian: email.fromCustodian,
        email_from_custodian_lc: email.fromCustodian.toLowerCase(),
        email_to: email.to,
        email_to_sort: email.to.slice(0, 254),
        email_to_lc: email.to.toLowerCase(),
        email_to_custodians: email.toCustodians.toString(),
        email_to_custodians_lc: email.toCustodians.toString().toLowerCase(),
        email_cc: email.cc,
        email_cc_lc: email.cc.toLowerCase(),
        email_bcc: email.bcc,
        email_bcc_lc: email.bcc.toLowerCase(),
        email_subject: email.subject,
        email_subject_sort: email.subject.slice(0, 254),
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

  const insertEmailSentByDay = async (
    emailSentByDay: EmailSentByDay[]
  ): Promise<void> => {
    emailSentByDay.forEach(async (day) => {
      await db(emailSentByDayCollection).insert({
        day_sent: day.sent,
        emailIds: day.emailIds.join(','),
      })
    })
  }

  const insertCustodians = async (custodians: Custodian[]): Promise<void> => {
    custodians.forEach(async (custodian) => {
      await db(custodianCollection).insert({
        custodian_id: custodian.id,
        custodian_name: custodian.name,
        title: custodian.title,
        color: custodian.color,
        sender_total: custodian.senderTotal,
        receiver_total: custodian.receiverTotal,
        to_custodians: JSON.stringify(custodian.toCustodians),
        from_custodians: JSON.stringify(custodian.fromCustodians),
      })
    })
  }

  process.send(`connect to sqlserver`)
  let pool = await sql.connect({
    server: process.env.SQL_HOST,
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
  })

  process.send(`drop database`)
  await pool.query('drop database if exists ' + dbName)

  process.send(`create database`)
  await pool.query('create database ' + dbName)

  pool = await sql.connect({
    server: process.env.SQL_HOST,
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    database: dbName,
  })
  await pool.query(
    `CREATE TABLE [${emailCollection}] ([email_id] nvarchar(255), [email_sent] datetime2, [email_from] nvarchar(max), [email_from_lc] nvarchar(max), [email_from_custodian] nvarchar(max), [email_from_custodian_lc] nvarchar(max), [email_to] nvarchar(max), [email_to_lc] nvarchar(max), [email_to_custodians] nvarchar(max), [email_to_custodians_lc] nvarchar(max), [email_cc] nvarchar(max), [email_cc_lc] nvarchar(max), [email_bcc] nvarchar(max), [email_bcc_lc] nvarchar(max), [email_subject] nvarchar(max), [email_subject_lc] nvarchar(max), [email_body] nvarchar(max), [email_body_lc] nvarchar(max), CONSTRAINT [email_pkey] PRIMARY KEY ([email_id]))`
  )
  await pool.query(
    `CREATE TABLE [${wordCloudCollection}] ([tag] nvarchar(255), [weight] int, CONSTRAINT [wordcloud_pkey] PRIMARY KEY ([tag]))`
  )
  await pool.query(
    `CREATE TABLE [${emailSentByDayCollection}] ([day_sent] datetime2, [emailIds] nvarchar(max), CONSTRAINT [emailsentbyday_pkey] PRIMARY KEY ([day_sent]))`
  )
  // await pool.query(
  //   `alter table ${emailSentByDayCollection} add constraint emailsentbyday_pkey primary key (day_sent)`
  // )
  // await pool.query(
  //   `create table ${custodianCollection} (custodian_id nvarchar(255), custodian_name nvarchar(max), title nvarchar(max), color nvarchar(max), sender_total integer, receiver_total integer, to_custodians nvarchar(max), from_custodians nvarchar(max))`
  // )
  // await pool.query(
  //   `alter table ${custodianCollection} add constraint custodians_pkey primary key (custodian_id)`
  // )

  const db = knex({
    client: 'mssql',
    debug: true,
    connection: {
      host: process.env.SQL_HOST,
      user: process.env.SQL_USER,
      password: process.env.SQL_PASSWORD,
      database: dbName,
    },
  })

  await db.schema.createTable(emailSentByDayCollection, (table) => {
    table.datetime('day_sent').primary()
    table.text('emailIds')
  })
  // await db.schema.createTable(custodianCollection, (table) => {
  //   table.string('custodian_id').primary()
  //   table.text('custodian_name')
  //   table.text('title')
  //   table.text('color')
  //   table.integer('sender_total')
  //   table.integer('receiver_total')
  //   table.text('to_custodians')
  //   table.text('from_custodians')
  // })

  // process.send(`process emails`)
  // const numEmails = await walkFSfolder(insertEmails, (msg) => process.send(msg))

  // process.send(`process word cloud`)
  // await processWordCloud(insertWordCloud, (msg) => process.send(msg))

  // process.send(`process email sent`)
  // await processEmailSentByDay(insertEmailSentByDay, (msg) => process.send(msg))

  // process.send(`create custodians`)
  // await processCustodians(insertCustodians, (msg) => process.send(msg))

  // process.send(`completed ${numEmails} emails`)
  // TODO proc not stopping?
  console.log('foo')
}

run().catch((err) => console.error(err))
