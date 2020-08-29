import {
  dbName,
  Email,
  emailCollection,
  mongodbServer,
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

// eslint-disable-next-line @typescript-eslint/no-extra-semi
;(async (): Promise<void> => {
  try {
    console.log(`connecting to ${mongodbServer}`)
    const client = await mongodb.MongoClient.connect(mongodbServer, {
      useUnifiedTopology: false,
    })
    db = client.db(dbName)

    console.log(`dropping database ${mongodbServer}`)
    await db.dropDatabase()

    const numEmails = await walkFSfolder(insertEmails)

    // processContacts()
    // processEmailSent()
    await processWordCloud(insertWordCloud)

    console.log('creating indexes')
    await db.collection(emailCollection).createIndex({ '$**': 'text' })

    console.log(`${numEmails} emails processed`)
    // client.close();
  } catch (error) {
    console.error(error)
  }
})()
