import {
  custodianCollection,
  dbName,
  emailCollection,
  emailSentByDayCollection,
  processCustodians,
  processEmailSentByDay,
  processWordCloud,
  walkFSfolder,
  sleep,
  wordCloudCollection,
} from '@klonzo/common'
// import { Client } from 'pg'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { Pool, Client } = require('pg')
import * as dotenv from 'dotenv'
import { v4 as uuidv4 } from 'uuid'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const knex = require('knex')
dotenv.config()

async function run() {
  const insertEmails = async (emails) => {
    return
    const client = new Client({
      user: process.env.PGUSER,
      host: process.env.PGHOST,
      password: process.env.PGPASSWORD,
      database: dbName,
    })
    await client.connect()
    emails.forEach(async (email) => {
      const q =
        'insert into email (' +
        'email_id,' +
        'email_sent,' +
        'email_from,' +
        'email_from_lc,' +
        'email_from_custodian,' +
        'email_from_custodian_lc,' +
        'email_to,' +
        'email_to_lc,' +
        'email_to_custodians,' +
        'email_to_custodians_lc,' +
        'email_cc,' +
        'email_cc_lc,' +
        'email_bcc,' +
        'email_bcc_lc,' +
        'email_subject,' +
        'email_subject_lc,' +
        'email_body,' +
        'email_body_lc' +
        ') values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)'
      const values = [
        uuidv4(),
        email.sent,
        email.from,
        email.from.toLowerCase(), // lower case of text fields for faster search
        email.fromCustodian,
        email.fromCustodian.toLowerCase(),
        email.to,
        email.to.toLowerCase(),
        email.toCustodians.toString(),
        email.toCustodians.toString().toLowerCase(),
        email.cc,
        email.cc.toLowerCase(),
        email.bcc,
        email.bcc.toLowerCase(),
        email.subject,
        email.subject.toLowerCase(),
        email.body,
        email.body.toLowerCase(),
      ]
      await client.query(q, values).catch((err) => console.error(err))
    })
    await client.end()
  }

  const insertWordCloud = async (wordCloud) => {
    // TODO try using pools https://node-postgres.com/features/connecting

    const pool = new Pool({
      user: process.env.PGUSER,
      host: process.env.PGHOST,
      password: process.env.PGPASSWORD,
      database: dbName,
    })
    const q = 'insert into wordcloud (tag, weight) values ($1, $2)'
    wordCloud.forEach(async (word) => {
      const values = [word.tag, word.weight]
      await pool.query(q, values).catch((err) => console.error(err))
    })
    await pool.end()
  }

  // const insertEmailSentByDay = async (emailSentByDay) => {
  //   emailSentByDay.forEach(async (day) => {
  //     await db(emailSentByDayCollection).insert({
  //       day_sent: day.sent,
  //       emailIds: day.emailIds.join(','),
  //     })
  //   })
  // }

  // const insertCustodians = async (custodians) => {
  //   custodians.forEach(async (custodian) => {
  //     await db(custodianCollection).insert({
  //       custodian_id: custodian.id,
  //       custodian_name: custodian.name,
  //       title: custodian.title,
  //       color: custodian.color,
  //       sender_total: custodian.senderTotal,
  //       receiver_total: custodian.receiverTotal,
  //       to_custodians: JSON.stringify(custodian.toCustodians),
  //       from_custodians: JSON.stringify(custodian.fromCustodians),
  //     })
  //   })
  // }

  process.send(`connect`)
  let client = new Client()
  await client.connect()

  // TODO use collection names

  process.send(`drop database`)
  try {
    await client.query(`revoke connect on database ${dbName} from public`)
    await client.query(
      `select pg_terminate_backend(pg_stat_activity.pid) from pg_stat_activity where pg_stat_activity.datname = '${dbName}'`
    )
  } catch (err) {}
  try {
    await client.query('drop database if exists ' + dbName)
  } catch (err) {}

  process.send(`create database`)
  await client.query('create database ' + dbName)
  await client.end()

  client = new Client({ database: dbName })
  await client.connect()
  await client.query(
    'create table "email" ("email_id" varchar(255), "email_sent" timestamptz, "email_from" text, "email_from_lc" text, "email_from_custodian" text, "email_from_custodian_lc" text, "email_to" text, "email_to_lc" text, "email_to_custodians" text, "email_to_custodians_lc" text, "email_cc" text, "email_cc_lc" text, "email_bcc" text, "email_bcc_lc" text, "email_subject" text, "email_subject_lc" text, "email_body" text, "email_body_lc" text)'
  )
  await client.query(
    'alter table "email" add constraint "email_pkey" primary key ("email_id")'
  )
  await client.query(
    'create table "wordcloud" ("tag" varchar(255), "weight" integer)'
  )
  await client.query(
    'alter table "wordcloud" add constraint "wordcloud_pkey" primary key ("tag")'
  )
  await client.query(
    'create table "emailsentbyday" ("day_sent" timestamptz, "emailIds" text)'
  )
  await client.query(
    'alter table "emailsentbyday" add constraint "emailsentbyday_pkey" primary key ("day_sent")'
  )
  await client.query(
    'create table "custodians" ("custodian_id" varchar(255), "custodian_name" text, "title" text, "color" text, "sender_total" integer, "receiver_total" integer, "to_custodians" text, "from_custodians" text)'
  )
  await client.query(
    'alter table "custodians" add constraint "custodians_pkey" primary key ("custodian_id")'
  )
  await client.end()

  // const db = knex({
  //   client: 'pg',
  //   debug: true,
  //   connection: {
  //     host: process.env.PGHOST,
  //     password: process.env.PGPASSWORD,
  //     database: dbName,
  //   },
  // })

  process.send(`process emails`)
  const numEmails = await walkFSfolder(insertEmails, (msg) => process.send(msg))

  process.send(`process word cloud`)
  await processWordCloud(insertWordCloud, (msg) => process.send(msg))

  // process.send(`process email sent`)
  // await processEmailSentByDay(insertEmailSentByDay, (msg) => process.send(msg))

  // process.send(`process custodians`)
  // await processCustodians(insertCustodians, (msg) => process.send(msg))

  // process.send(`completed ${numEmails} emails`)

  // wait a bit for db stuff to complete and exit
  // sleep(1000 * 60)
  // process.exit()
}

run().catch((err) => console.error(err))
