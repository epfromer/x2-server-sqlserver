import {
  custodianCollection,
  dbName,
  emailCollection,
  emailSentByDayCollection,
  getNumPSTs,
  processCustodians,
  processEmailSentByDay,
  processWordCloud,
  walkFSfolder,
  wordCloudCollection,
} from '@klonzo/common'
import { Pool } from 'pg'
import { v4 as uuidv4 } from 'uuid'

async function run() {
  if (!getNumPSTs()) {
    process.send(`no PSTs found`)
    return
  }

  const insertEmails = async (emails) => {
    const pool = new Pool({ database: dbName })
    const q = `insert into ${emailCollection} (email_id, email_sent, email_from, email_from_lc, email_from_custodian, email_from_custodian_lc, email_to, email_to_lc, email_to_custodians, email_to_custodians_lc, email_cc, email_cc_lc, email_bcc, email_bcc_lc, email_subject, email_subject_lc, email_body, email_body_lc) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)`
    emails.forEach(async (email) => {
      await pool.query(q, [
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
      ])
    })
  }

  const insertWordCloud = async (wordCloud) => {
    const pool = new Pool({ database: dbName })
    const q = `insert into ${wordCloudCollection} (tag, weight) values ($1, $2)`
    wordCloud.forEach(async (word) => {
      await pool.query(q, [word.tag, word.weight])
    })
  }

  const insertEmailSentByDay = async (emailSentByDay) => {
    const pool = new Pool({ database: dbName })
    const q = `insert into ${emailSentByDayCollection} (day_sent, email_ids) values ($1, $2)`
    emailSentByDay.forEach(async (day) => {
      await pool.query(q, [day.sent, day.emailIds.join(',')])
    })
  }

  const insertCustodians = async (custodians) => {
    const pool = new Pool({ database: dbName })
    const q = `insert into ${custodianCollection} (custodian_id, custodian_name, title, color, sender_total, receiver_total, to_custodians, from_custodians) values ($1, $2, $3, $4, $5, $6, $7, $8)`
    custodians.forEach(async (custodian) => {
      await pool.query(q, [
        custodian.id,
        custodian.name,
        custodian.title,
        custodian.color,
        custodian.senderTotal,
        custodian.receiverTotal,
        JSON.stringify(custodian.toCustodians),
        JSON.stringify(custodian.fromCustodians),
      ])
    })
  }

  process.send(`connect to postgres at ${process.env.PGHOST}`)
  let pool = new Pool()

  process.send(`drop database`)
  try {
    await pool.query(`revoke connect on database ${dbName} from public`)
    await pool.query(
      `select pg_terminate_backend(pg_stat_activity.pid) from pg_stat_activity where pg_stat_activity.datname = '${dbName}'`
    )
  } catch (err) {}
  try {
    await pool.query('drop database if exists ' + dbName)
  } catch (err) {}

  process.send(`create database`)
  await pool.query('create database ' + dbName)

  pool = new Pool({ database: dbName })
  await pool.query(
    `create table ${emailCollection} (email_id varchar(255), email_sent timestamptz, email_from text, email_from_lc text, email_from_custodian text, email_from_custodian_lc text, email_to text, email_to_lc text, email_to_custodians text, email_to_custodians_lc text, email_cc text, email_cc_lc text, email_bcc text, email_bcc_lc text, email_subject text, email_subject_lc text, email_body text, email_body_lc text)`
  )
  await pool.query(
    `alter table ${emailCollection} add constraint email_pkey primary key (email_id)`
  )
  await pool.query(
    `create table ${wordCloudCollection} (tag varchar(255), weight integer)`
  )
  await pool.query(
    `alter table ${wordCloudCollection} add constraint wordcloud_pkey primary key (tag)`
  )
  await pool.query(
    `create table ${emailSentByDayCollection} (day_sent timestamptz, email_ids text)`
  )
  await pool.query(
    `alter table ${emailSentByDayCollection} add constraint emailsentbyday_pkey primary key (day_sent)`
  )
  await pool.query(
    `create table ${custodianCollection} (custodian_id varchar(255), custodian_name text, title text, color text, sender_total integer, receiver_total integer, to_custodians text, from_custodians text)`
  )
  await pool.query(
    `alter table ${custodianCollection} add constraint custodians_pkey primary key (custodian_id)`
  )

  process.send(`process emails`)
  const numEmails = await walkFSfolder(insertEmails, (msg) => process.send(msg))

  process.send(`process word cloud`)
  await processWordCloud(insertWordCloud, (msg) => process.send(msg))

  process.send(`process email sent`)
  await processEmailSentByDay(insertEmailSentByDay, (msg) => process.send(msg))

  process.send(`process custodians`)
  await processCustodians(insertCustodians, (msg) => process.send(msg))

  process.send(`completed ${numEmails} emails`)
}

run().catch((err) => console.error(err))
