import { Client } from '@elastic/elasticsearch'
import {
  Contact,
  dbName,
  elasticServer,
  Email,
  EmailSentREMOVE,
  walkFSfolder,
  WordCloudTag,
} from '@klonzo/common'
import { v4 as uuidv4 } from 'uuid'

// https://www.elastic.co/blog/new-elasticsearch-javascript-client-released
// https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/7.x/introduction.html
// http://localhost:9200/x2
// http://localhost:9200/x2/_search?q=*

export let client: Client

async function insertEmails(emails: Email[]): Promise<void> {
  // TODO bulk insert
  emails.forEach(async (email) => {
    await client.index({
      index: dbName,
      body: {
        id: uuidv4(),
        sent: email.sent,
        sentShort: email.sentShort,
        from: email.from,
        fromContact: email.fromContact,
        to: email.to,
        toContact: email.toContact,
        cc: email.cc,
        bcc: email.bcc,
        subject: email.subject,
        body: email.body,
      },
    })
  })
  console.log('insert emails')
  // await db.collection(emailCollection).insertMany(emails)
}

async function insertWordCloud(words: WordCloudTag[]): Promise<void> {
  // await db.collection(wordCloudCollection).insertMany(words)
}

async function insertEmailSent(email: EmailSentREMOVE[]): Promise<void> {
  // await db.collection(emailSentCollection).insertMany(email)
}

async function insertContacts(contacts: Contact[]): Promise<void> {
  // await db.collection(contactCollection).insertMany(contacts)
}

// eslint-disable-next-line @typescript-eslint/no-extra-semi
async function run() {
  console.log(`${elasticServer}: connecting`)
  client = new Client({ node: elasticServer })

  console.log(`drop database`)
  try {
    await client.indices.delete({ index: dbName })
  } catch (error) {
    console.error(error)
  }

  console.log(`create indexes`)
  await client.indices.create({ index: dbName })

  console.log(`insert emails`)
  const numEmails = await walkFSfolder(insertEmails)

  console.log(`insert contacts`)
  // await processContacts(insertContacts)

  console.log(`insert email sent`)
  // await processEmailSent(insertEmailSent)

  console.log(`insert word cloud`)
  // await processWordCloud(insertWordCloud)

  console.log(`refresh index`)
  await client.indices.refresh({ index: dbName })

  console.log(`complete, ${numEmails} emails processed`)
}

run().catch(console.error)
