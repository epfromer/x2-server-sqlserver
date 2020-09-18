import {
  Custodian,
  custodianCollection,
  dbName,
  Email,
  emailCollection,
  EmailSentByDay,
  emailSentByDayCollection,
  getNumPSTs,
  processCustodians,
  processEmailSentByDay,
  processWordCloud,
  walkFSfolder,
  wordCloudCollection,
  WordCloudTag,
} from '@klonzo/common'
import sql from 'mssql'
import { v4 as uuidv4 } from 'uuid'

async function run() {
  if (!getNumPSTs()) {
    process.send(`no PSTs found`)
    return
  }

  const connect = async () =>
    await sql.connect({
      server: process.env.SQL_HOST,
      user: process.env.SQL_USER,
      password: process.env.SQL_PASSWORD,
      database: dbName,
    })

  const insertEmails = async (emails: Email[]): Promise<void> => {
    const pool = await connect()
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
    return pool.close()
  }

  const insertWordCloud = async (wordCloud: WordCloudTag[]): Promise<void> => {
    const pool = await connect()
    const table = new sql.Table(wordCloudCollection)
    table.create = true

    table.columns.add('tag', sql.VarChar(256), { nullable: false })
    table.columns.add('weight', sql.VarChar(256), { nullable: false })

    wordCloud.forEach((word) => table.rows.add(word.tag, word.weight))

    const request = new sql.Request(pool)
    await request.bulk(table)
    return pool.close()
  }

  const insertEmailSentByDay = async (
    emailSentByDay: EmailSentByDay[]
  ): Promise<void> => {
    const pool = await connect()
    const table = new sql.Table(emailSentByDayCollection)
    table.create = true

    table.columns.add('day_sent', sql.VarChar(30), { nullable: false })
    table.columns.add('email_ids', sql.VarChar(sql.MAX), { nullable: false })

    emailSentByDay.forEach((day) =>
      table.rows.add(day.sent, day.emailIds.join(','))
    )

    const request = new sql.Request(pool)
    await request.bulk(table)
    return pool.close()
  }

  const insertCustodians = async (custodians: Custodian[]): Promise<void> => {
    const pool = await sql.connect({
      server: process.env.SQL_HOST,
      user: process.env.SQL_USER,
      password: process.env.SQL_PASSWORD,
      database: dbName,
    })

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
    table.columns.add('from_custodians', sql.VarChar(sql.MAX), {
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
        JSON.stringify(custodian.toCustodians),
        JSON.stringify(custodian.fromCustodians)
      )
    )

    const request = new sql.Request(pool)
    await request.bulk(table)
    return pool.close()
  }

  process.send(`connect to sqlserver at ${process.env.SQL_HOST}`)
  const pool = await sql.connect({
    server: process.env.SQL_HOST,
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
  })

  process.send(`drop database`)
  await pool.query('drop database if exists ' + dbName)

  process.send(`create database`)
  await pool.query('create database ' + dbName)

  await pool.close()

  process.send(`process emails`)
  const numEmails = await walkFSfolder(insertEmails, (msg) => process.send(msg))

  process.send(`process word cloud`)
  await processWordCloud(insertWordCloud, (msg) => process.send(msg))

  process.send(`process email sent`)
  await processEmailSentByDay(insertEmailSentByDay, (msg) => process.send(msg))

  process.send(`create custodians`)
  await processCustodians(insertCustodians, (msg) => process.send(msg))

  process.send(`completed ${numEmails} emails`)
}

run().catch((err) => console.error(err))
