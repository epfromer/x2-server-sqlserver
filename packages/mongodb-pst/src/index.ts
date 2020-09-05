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

const insertEmails = async (email: Email[]): Promise<void> => {
  await db.collection(emailCollection).insertMany(email)
}

const insertWordCloud = async (wordCloud: WordCloudTag[]): Promise<void> => {
  await db.collection(wordCloudCollection).insertMany(wordCloud)
}

const insertEmailSent = async (emailSent: EmailSentREMOVE[]): Promise<void> => {
  await db.collection(emailSentCollection).insertMany(emailSent)
}

const insertContacts = async (contacts: Contact[]): Promise<void> => {
  await db.collection(contactCollection).insertMany(contacts)
}

// eslint-disable-next-line @typescript-eslint/no-extra-semi
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

  console.log(`insert contacts`)
  await processContacts(insertContacts)

  console.log(`create index`)
  await db.collection(emailCollection).createIndex({ '$**': 'text' })

  console.log(`complete, ${numEmails} emails processed`)
}

run().catch(console.error)
