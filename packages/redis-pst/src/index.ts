import * as dotenv from 'dotenv'
import redis from 'redis'
import redisearch from 'redis-redisearch'
import { promisify } from 'util'

redisearch(redis)
dotenv.config()

const client = redis.createClient()
client.on('error', function (error) {
  console.error(error)
})

// let db

// const insertEmails = async (emails: Email[]): Promise<void> => {}

// const insertWordCloud = async (wordCloud: WordCloudTag[]): Promise<void> => {}

// const insertEmailSentByDay = async (
//   emailSentByDay: EmailSentByDay[]
// ): Promise<void> => {}

// const insertCustodians = async (custodians: Custodian[]): Promise<void> => {}

const ftDropAsync = promisify(client.ft_drop).bind(client)
const ftCreateAsync = promisify(client.ft_create).bind(client)
const ftAddAsync = promisify(client.ft_add).bind(client)
const ftSearchAsync = promisify(client.ft_search).bind(client)

async function run() {
  await ftDropAsync(['foo'])

  await ftCreateAsync(['foo', 'SCHEMA', 'name', 'TEXT'])
  console.log('created')

  await ftAddAsync(['foo', 101010, 1.0, 'FIELDS', 'name', 'ed is Super cool'])
  console.log('added')

  const res = await ftSearchAsync(['foo', 'super'])
  console.log('search complete', res)

  // console.log(`connect to redis`)
  // await client.connect()

  // console.log(`drop database`)
  // await client.query('drop database if exists ' + dbName)

  // console.log(`create database`)
  // await client.query('create database ' + dbName)
  // client.end()

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
