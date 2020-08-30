import {
  Contact,
  contactCollection,
  dbName,
  Email,
  emailCollection,
  emailSentCollection,
  EmailSentREMOVE,
  processContacts,
  processEmailSent,
  processWordCloud,
  walkFSfolder,
  wordCloudCollection,
  elasticServer,
  WordCloudTag,
} from '@klonzo/common'
import * as elasticsearch from 'elasticsearch'

export let db: any

async function insertEmails(emails: Email[]): Promise<void> {
  console.log('insert emails')
  // await db.collection(emailCollection).insertMany(emails)
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
;(async (): Promise<void> => {
  try {
    console.log(`${elasticServer}: connecting`)
    db = new elasticsearch.Client({ host: elasticServer, log: 'error' })

    console.log(`${elasticServer}: dropping database`)
    try {
      await db.indices.delete({ index: dbName })
    } catch (error) {
      console.error(error)
    }

    console.log(`${elasticServer}: creating indexes`)
    await db.indices.create({ index: dbName })

    console.log(`${elasticServer}: inserting emails`)
    const numEmails = await walkFSfolder(insertEmails)

    console.log(`${elasticServer}: inserting contacts`)
    // await processContacts(insertContacts)

    console.log(`${elasticServer}: inserting email sent`)
    // await processEmailSent(insertEmailSent)

    console.log(`${elasticServer}: inserting word cloud`)
    // await processWordCloud(insertWordCloud)

    console.log(`${elasticServer}: complete, ${numEmails} emails processed`)
    // client.close();
  } catch (error) {
    console.error(error)
  }
})()
