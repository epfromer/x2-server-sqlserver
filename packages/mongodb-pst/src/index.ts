import {
  Contact,
  contactCollection,
  dbName,
  Email,
  emailCollection,
  emailSentCollection,
  EmailSentREMOVE,
  mongodbServer,
  processContacts,
  processEmailSent,
  processWordCloud,
  walkFSfolder,
  wordCloudCollection,
  WordCloudTag,
} from '@klonzo/common'
import * as mongodb from 'mongodb'

export let db: mongodb.Db

async function insertEmails(emails: Email[]): Promise<void> {
  await db.collection(emailCollection).insertMany(emails)
}

async function insertWordCloud(words: WordCloudTag[]): Promise<void> {
  await db.collection(wordCloudCollection).insertMany(words)
}

async function insertEmailSent(email: EmailSentREMOVE[]): Promise<void> {
  await db.collection(emailSentCollection).insertMany(email)
}

async function insertContacts(contacts: Contact[]): Promise<void> {
  await db.collection(contactCollection).insertMany(contacts)
}

// eslint-disable-next-line @typescript-eslint/no-extra-semi
async function run() {
  console.log(`${mongodbServer}: connecting`)
  const client = await mongodb.MongoClient.connect(mongodbServer, {
    useUnifiedTopology: false,
  })
  db = client.db(dbName)

  console.log(`${mongodbServer}: dropping database`)
  await db.dropDatabase()

  console.log(`${mongodbServer}: inserting emails`)
  const numEmails = await walkFSfolder(insertEmails)

  console.log(`${mongodbServer}: inserting contacts`)
  await processContacts(insertContacts)

  console.log(`${mongodbServer}: inserting email sent`)
  await processEmailSent(insertEmailSent)

  console.log(`${mongodbServer}: inserting word cloud`)
  await processWordCloud(insertWordCloud)

  console.log(`${mongodbServer}: creating indexes`)
  await db.collection(emailCollection).createIndex({ '$**': 'text' })

  console.log(`${mongodbServer}: complete, ${numEmails} emails processed`)
}

run().catch(console.error)
