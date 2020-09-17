import {
  Custodian,
  custodianCollection,
  dbName,
  Email,
  emailCollection,
  EmailSentByDay,
  emailSentByDayCollection,
  mongodbServer,
  processCustodians,
  processEmailSentByDay,
  processWordCloud,
  walkFSfolder,
  wordCloudCollection,
  WordCloudTag,
} from '@klonzo/common'
import * as dotenv from 'dotenv'
import * as mongodb from 'mongodb'
dotenv.config()

async function run() {
  process.send(`connect`)
  const client = await mongodb.MongoClient.connect(mongodbServer, {
    useUnifiedTopology: false,
  })
  const db = client.db(dbName)

  const insertEmails = async (email: Email[]): Promise<void> => {
    await db.collection(emailCollection).insertMany(email)
  }

  const insertWordCloud = async (wordCloud: WordCloudTag[]): Promise<void> => {
    await db.collection(wordCloudCollection).insertMany(wordCloud)
  }

  const insertEmailSentByDay = async (
    emailSentByDay: EmailSentByDay[]
  ): Promise<void> => {
    await db.collection(emailSentByDayCollection).insertMany(emailSentByDay)
  }

  const insertCustodians = async (Custodians: Custodian[]): Promise<void> => {
    await db.collection(custodianCollection).insertMany(Custodians)
  }

  process.send(`drop database`)
  await db.dropDatabase()

  process.send(`process emails`)
  const numEmails = await walkFSfolder(insertEmails, (msg) => process.send(msg))

  process.send(`process word cloud`)
  await processWordCloud(insertWordCloud, (msg) => process.send(msg))

  process.send(`process email sent`)
  await processEmailSentByDay(insertEmailSentByDay, (msg) => process.send(msg))

  process.send(`create custodians`)
  await processCustodians(insertCustodians, (msg) => process.send(msg))

  process.send(`create index`)
  await db.collection(emailCollection).createIndex({ '$**': 'text' })

  process.send(`completed ${numEmails} emails`)
  client.close()
}

run().catch((err) => console.error(err))
