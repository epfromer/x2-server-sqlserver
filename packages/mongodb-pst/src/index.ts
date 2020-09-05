import {
  Custodian,
  custodianCollection,
  dbName,
  Email,
  emailCollection,
  emailSentCollection,
  EmailSentREMOVE,
  mongodbServer,
  processCustodians,
  processEmailSent,
  processWordCloud,
  walkFSfolder,
  wordCloudCollection,
  WordCloudTag,
} from '@klonzo/common'
import * as mongodb from 'mongodb'

export let db: mongodb.Db

const insertEmails = async (email: Email[]): Promise<void> => {
  await db.collection(emailCollection).insertMany(email)
}

const insertWordCloud = async (wordCloud: WordCloudTag[]): Promise<void> => {
  await db.collection(wordCloudCollection).insertMany(wordCloud)
}

const insertEmailSent = async (emailSent: EmailSentREMOVE[]): Promise<void> => {
  await db.collection(emailSentCollection).insertMany(emailSent)
}

const insertCustodians = async (Custodians: Custodian[]): Promise<void> => {
  await db.collection(custodianCollection).insertMany(Custodians)
}

async function run() {
  console.log(`${mongodbServer}: connecting`)
  const client = await mongodb.MongoClient.connect(mongodbServer, {
    useUnifiedTopology: false,
  })
  db = client.db(dbName)

  console.log(`drop database`)
  await db.dropDatabase()

  console.log(`insert emails`)
  const numEmails = await walkFSfolder(insertEmails)

  console.log(`insert word cloud`)
  await processWordCloud(insertWordCloud)

  console.log(`insert email sent`)
  await processEmailSent(insertEmailSent)

  console.log(`insert Custodians`)
  await processCustodians(insertCustodians)

  console.log(`create index`)
  await db.collection(emailCollection).createIndex({ '$**': 'text' })

  console.log(`complete, ${numEmails} emails processed`)
}

run().catch(console.error)
