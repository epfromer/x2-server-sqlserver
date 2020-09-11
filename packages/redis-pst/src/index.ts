import * as dotenv from 'dotenv'
import redis from 'redis'
import redisearch from 'redis-redisearch'
import { promisify } from 'util'
import {
  Custodian,
  custodianCollection,
  dbName,
  elasticServer,
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
import { v4 as uuidv4 } from 'uuid'

redisearch(redis)
dotenv.config()

console.log(`connect to redis`)
const client = redis.createClient()
client.on('error', function (error) {
  console.error(error)
})

const ftDropAsync = promisify(client.ft_drop).bind(client)
// https://oss.redislabs.com/redisearch/Commands.html#ftcreate
const ftCreateAsync = promisify(client.ft_create).bind(client)
const ftAddAsync = promisify(client.ft_add).bind(client)

const insertEmails = async (emails: Email[]): Promise<void> => {
  emails.forEach(async (email) => {
    await ftAddAsync([
      dbName + emailCollection,
      uuidv4(),
      1.0,
      'FIELDS',
      'sent',
      new Date(email.sent).getTime(),
      'sentStr',
      new Date(email.sent),
      'from',
      email.from,
      'fromCustodian',
      email.fromCustodian,
      'emailto',
      email.to,
      'toCustodians',
      email.toCustodians.join(','),
      'cc',
      email.cc,
      'bcc',
      email.bcc,
      'subject',
      email.subject,
      'body',
      email.body,
    ])
  })
}

// const insertWordCloud = async (wordCloud: WordCloudTag[]): Promise<void> => {}

// const insertEmailSentByDay = async (
//   emailSentByDay: EmailSentByDay[]
// ): Promise<void> => {}

// const insertCustodians = async (custodians: Custodian[]): Promise<void> => {}

async function run() {
  console.log(`drop database`)
  try {
    await ftDropAsync([dbName + emailCollection])
  } catch (err) {
    console.error(err)
  }

  console.log(`create database`)
  await ftCreateAsync([
    dbName + emailCollection,
    'SCHEMA',
    'sent',
    'NUMERIC',
    'SORTABLE',
    'sentStr',
    'TEXT',
    'from',
    'TEXT',
    'SORTABLE',
    'fromCustodian',
    'TEXT',
    'emailto',
    'TEXT',
    'SORTABLE',
    'toCustodians',
    'TEXT',
    'cc',
    'TEXT',
    'bcc',
    'TEXT',
    'subject',
    'TEXT',
    'SORTABLE',
    'body',
    'TEXT',
  ])

  console.log(`insert emails`)
  const numEmails = await walkFSfolder(insertEmails)

  // console.log(`insert word cloud`)
  // await processWordCloud(insertWordCloud)

  // console.log(`insert email sent`)
  // await processEmailSentByDay(insertEmailSentByDay)

  // console.log(`insert custodians`)
  // await processCustodians(insertCustodians)

  console.log(`completed ${numEmails} emails`)
}

run().catch(console.error)
