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

async function run() {
  dotenv.config()

  console.log(`connect to mysql`)
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const mysql = require('mysql2')
  const connection = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_ROOT_PASSWORD,
  })

  connection.query('SELECT 1 + 1 AS solution', function (
    error,
    results,
    fields
  ) {
    if (error) throw error
    console.log('The solution is: ', results[0].solution)
  })

  // console.log(`connect to mysql`)
  // console.log(process.env.MYSQL_HOST, process.env.MYSQL_ROOT_PASSWORD)

  // // eslint-disable-next-line @typescript-eslint/no-var-requires
  // const db = require('knex')({
  //   client: 'mysql',
  //   connection: {
  //     host: '127.0.0.1',
  //     user: 'foo',
  //     password: 'f00bar',
  //     database: dbName,
  //   },
  // })

  // console.log('connected')

  // const users = await db.select('now()')
  // console.log(users)

  // const insertEmails = async (emails: Email[]): Promise<void> => {}

  // const insertWordCloud = async (wordCloud: WordCloudTag[]): Promise<void> => {}

  // const insertEmailSentByDay = async (
  //   emailSentByDay: EmailSentByDay[]
  // ): Promise<void> => {}

  // const insertCustodians = async (custodians: Custodian[]): Promise<void> => {}

  // console.log(`drop database`)
  // try {
  // } catch (err) {
  //   console.error(err)
  // }

  // console.log(`create database`)

  // console.log(`insert emails`)
  // const numEmails = await walkFSfolder(insertEmails)

  // console.log(`insert word cloud`)
  // await processWordCloud(insertWordCloud)

  // console.log(`insert email sent`)
  // await processEmailSentByDay(insertEmailSentByDay)

  // console.log(`insert custodians`)
  // await processCustodians(insertCustodians)

  // console.log(`completed ${numEmails} emails`)
}

run().catch(console.error)
