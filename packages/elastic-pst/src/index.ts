import { Client } from '@elastic/elasticsearch'
import {
  Custodian,
  custodianCollection,
  dbName,
  elasticServer,
  Email,
  emailSentByDayCollection,
  EmailSentByDay,
  processCustodians,
  processEmailSentByDay,
  processWordCloud,
  walkFSfolder,
  wordCloudCollection,
  WordCloudTag,
} from '@klonzo/common'
import { v4 as uuidv4 } from 'uuid'

// https://www.elastic.co/blog/new-elasticsearch-javascript-client-released
// https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/7.x/introduction.html
// http://localhost:9200/x2
// http://localhost:9200/x2/_search?q=*

export let client: Client

const insertEmails = async (emails: Email[]): Promise<void> => {
  // TODO bulk insert
  emails.forEach(async (email) => {
    await client.index({
      index: dbName,
      body: {
        id: uuidv4(),
        sent: email.sent,
        sentShort: email.sentShort,
        from: email.from,
        fromCustodian: email.fromCustodian,
        to: email.to,
        toCustodians: email.toCustodians,
        cc: email.cc,
        bcc: email.bcc,
        subject: email.subject,
        body: email.body,
      },
    })
  })
}

const insertWordCloud = async (wordCloud: WordCloudTag[]): Promise<void> => {
  await client.index({
    index: dbName + wordCloudCollection,
    body: {
      wordCloudCollection: wordCloud,
    },
  })
}

const insertEmailSentByDay = async (email: EmailSentByDay[]): Promise<void> => {
  await client.index({
    index: dbName + emailSentByDayCollection,
    body: {
      emailSentCollection: email,
    },
  })
}

const insertCustodians = async (Custodians: Custodian[]): Promise<void> => {
  await client.index({
    index: dbName + custodianCollection,
    body: {
      CustodianCollection: Custodians,
    },
  })
}

// eslint-disable-next-line @typescript-eslint/no-extra-semi
async function run() {
  console.log(`connect to ${elasticServer}`)
  client = new Client({ node: elasticServer })

  console.log(`drop database`)
  try {
    await client.indices.delete({ index: dbName })
    await client.indices.delete({ index: dbName + wordCloudCollection })
    await client.indices.delete({ index: dbName + emailSentByDayCollection })
    await client.indices.delete({ index: dbName + custodianCollection })
  } catch (error) {
    console.error(error)
  }

  console.log(`create indexes`)
  await client.indices.create({ index: dbName })
  await client.indices.create({ index: dbName + wordCloudCollection })
  await client.indices.create({ index: dbName + emailSentByDayCollection })
  await client.indices.create({ index: dbName + custodianCollection })

  console.log(`insert emails`)
  const numEmails = await walkFSfolder(insertEmails)

  console.log(`insert word cloud`)
  await processWordCloud(insertWordCloud)

  console.log(`insert email sent`)
  await processEmailSentByDay(insertEmailSentByDay)

  console.log(`insert custodians`)
  await processCustodians(insertCustodians)

  console.log(`refresh index`)
  await client.indices.refresh({ index: dbName })

  console.log(`completed ${numEmails} emails`)
}

run().catch(console.error)
