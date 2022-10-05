import sql from 'mssql'
import { v4 as uuidv4 } from 'uuid'
import {
  Custodian,
  custodianCollection,
  dbName,
  Email,
  emailCollection,
  EmailSentByDay,
  emailSentByDayCollection,
  getEnv,
  getNumPSTs,
  getSQLConnection,
  processCustodians,
  processEmailSentByDay,
  processWordCloud,
  searchHistoryCollection,
  walkFSfolder,
  wordCloudCollection,
  WordCloudTag,
} from './common'

const processSend = (msg: string) => {
  if (!process || !process.send) {
    console.error('no process object or process.end undefined')
    return
  }
  process.send(msg)
}

async function run() {
  if (!getNumPSTs(process.argv[2])) {
    processSend(`no PSTs found in ${process.argv[2]}`)
    return
  }

  const dropAndCreateDatabase = async () => {
    const pool = await getSQLConnection(false)
    if (pool) {
      try {
        processSend(`drop database`)
        await pool.query('drop database if exists ' + dbName)

        processSend(`create database`)
        await pool.query('create database ' + dbName)
        await pool.close()
      } catch (err) {
        console.error(err)
      }
      return true
    } else {
      processSend(`no pool from connect`)
      return false
    }
  }

  if (!(await dropAndCreateDatabase())) {
    processSend('cannot drop and create database')
    return
  }

  processSend(`connect to ${getEnv('SQL_HOST')}`)
  const pool = await getSQLConnection()
  if (!pool) {
    processSend(`no pool from connect`)
    return
  }

  const insertEmails = async (emails: Email[]): Promise<void> => {
    const table = new sql.Table(emailCollection)
    table.create = true

    table.columns.add('email_id', sql.VarChar(uuidv4().length), {
      nullable: false,
      primary: true,
    })
    table.columns.add('email_sent', sql.DateTime2, { nullable: false })
    table.columns.add('email_from', sql.VarChar(sql.MAX), { nullable: false })
    table.columns.add('email_from_lc', sql.VarChar(sql.MAX), {
      nullable: false,
    })
    table.columns.add('email_from_custodian', sql.VarChar(sql.MAX), {
      nullable: false,
    })
    table.columns.add('email_from_custodian_lc', sql.VarChar(sql.MAX), {
      nullable: false,
    })
    table.columns.add('email_to', sql.VarChar(sql.MAX), { nullable: false })
    table.columns.add('email_to_lc', sql.VarChar(sql.MAX), { nullable: false })
    table.columns.add('email_to_custodians', sql.VarChar(sql.MAX), {
      nullable: false,
    })
    table.columns.add('email_to_custodians_lc', sql.VarChar(sql.MAX), {
      nullable: false,
    })
    table.columns.add('email_cc', sql.VarChar(sql.MAX), { nullable: false })
    table.columns.add('email_cc_lc', sql.VarChar(sql.MAX), {
      nullable: false,
    })
    table.columns.add('email_bcc', sql.VarChar(sql.MAX), { nullable: false })
    table.columns.add('email_bcc_lc', sql.VarChar(sql.MAX), { nullable: false })
    table.columns.add('email_subject', sql.VarChar(sql.MAX), {
      nullable: false,
    })
    table.columns.add('email_subject_lc', sql.VarChar(sql.MAX), {
      nullable: false,
    })
    table.columns.add('email_body', sql.VarChar(sql.MAX), { nullable: false })
    table.columns.add('email_body_lc', sql.VarChar(sql.MAX), {
      nullable: false,
    })

    emails.forEach((email) => {
      table.rows.add(
        uuidv4(),
        new Date(email.sent),
        email.from,
        email.from.toLowerCase(),
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
        email.body.toLowerCase()
      )
    })

    const request = new sql.Request(pool)
    await request.bulk(table)
  }

  const insertWordCloud = async (wordCloud: WordCloudTag[]): Promise<void> => {
    const table = new sql.Table(wordCloudCollection)
    table.create = true

    table.columns.add('tag', sql.VarChar(30), { nullable: false })
    table.columns.add('weight', sql.Int, { nullable: false })

    wordCloud.forEach((word) => table.rows.add(word.tag, word.weight))

    const request = new sql.Request(pool)
    await request.bulk(table)
  }

  const insertEmailSentByDay = async (
    emailSentByDay: EmailSentByDay[]
  ): Promise<void> => {
    const table = new sql.Table(emailSentByDayCollection)
    table.create = true

    table.columns.add('day_sent', sql.VarChar(30), { nullable: false })
    table.columns.add('total', sql.Int, { nullable: false })
    emailSentByDay.forEach((day) => table.rows.add(day.sent, day.total))

    const request = new sql.Request(pool)
    await request.bulk(table)
  }

  const insertCustodians = async (custodians: Custodian[]): Promise<void> => {
    const table = new sql.Table(custodianCollection)
    table.create = true

    table.columns.add('custodian_id', sql.VarChar(30), { nullable: false })
    table.columns.add('custodian_name', sql.VarChar(100), { nullable: false })
    table.columns.add('title', sql.VarChar(256), { nullable: false })
    table.columns.add('color', sql.VarChar(100), { nullable: false })
    table.columns.add('sender_total', sql.Int, { nullable: false })
    table.columns.add('receiver_total', sql.Int, { nullable: false })
    table.columns.add('to_custodians', sql.VarChar(sql.MAX), {
      nullable: false,
    })

    custodians.forEach((custodian) =>
      table.rows.add(
        custodian.id,
        custodian.name,
        custodian.title,
        custodian.color,
        custodian.senderTotal,
        custodian.receiverTotal,
        JSON.stringify(custodian.toCustodians)
      )
    )

    const request = new sql.Request(pool)
    await request.bulk(table)
  }

  await pool.query(
    `create table ${searchHistoryCollection} (history_id varchar(255) primary key, time_stamp varchar(25) not null, entry varchar(255) not null)`
  )

  processSend(`process emails`)
  const numEmails = await walkFSfolder(process.argv[2], insertEmails, (msg) =>
    processSend(msg)
  )

  processSend(`process word cloud`)
  await processWordCloud(insertWordCloud, (msg) => processSend(msg))

  processSend(`process email sent`)
  await processEmailSentByDay(insertEmailSentByDay, (msg) => processSend(msg))

  processSend(`create custodians`)
  await processCustodians(insertCustodians, (msg) => processSend(msg))

  processSend(`completed ${numEmails} emails in ${process.argv[2]}`)
  await pool.close()
}

run().catch((err) => console.error(err))
