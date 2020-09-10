import * as dotenv from 'dotenv'
import redis from 'redis'
import redisearch from 'redis-redisearch'
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

async function run() {
  // client.set('key', 'value', redis.print)
  // client.get('key', redis.print)

  client.ft_drop(['foo'], (err) => {
    if (err) console.error(err)
    client.ft_create(['foo', 'SCHEMA', 'name', 'TEXT'], (err) => {
      if (err) console.error(err)
      console.log('created')
      client.ft_add(
        ['foo', 101010, 1.0, 'FIELDS', 'name', 'ed is super cool'],
        (err) => {
          if (err) console.error(err)
          console.log('added')
          client.ft_search(['foo', 'super'], (err, docs) => {
            if (err) console.error(err)
            console.log('search complete', docs)
          })
        }
      )
    })
  })

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
