import { Client } from '@elastic/elasticsearch'
import {
  Custodian,
  custodianCollection,
  dbName,
  emailCollection,
  Email,
  EmailSentByDay,
  emailSentByDayCollection,
  getNumPSTs,
  processCustodians,
  processEmailSentByDay,
  processWordCloud,
  searchHistoryCollection,
  walkFSfolder,
  wordCloudCollection,
  WordCloudTag,
} from '@klonzo/common'
import * as dotenv from 'dotenv'
import { v4 as uuidv4 } from 'uuid'
dotenv.config()

// https://www.elastic.co/blog/new-elasticsearch-javascript-client-released
// https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/7.x/introduction.html
// http://localhost:9200/x2
// http://localhost:9200/x2/_search?q=*

async function run() {
  if (!getNumPSTs(process.argv[2])) {
    process.send(`no PSTs found in ${process.argv[2]}`)
    return
  }

  process.send(
    `connect to http://${process.env.ELASTIC_HOST}:${process.env.ELASTIC_PORT}`
  )
  const client = new Client({
    node: `http://${process.env.ELASTIC_HOST}:${process.env.ELASTIC_PORT}`,
  })

  const insertEmails = async (emails: Email[]): Promise<void> => {
    emails.forEach(async (email) => {
      await client.index({
        index: dbName + emailCollection,
        body: {
          id: uuidv4(),
          sent: new Date(email.sent).toISOString(),
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

  const insertEmailSentByDay = async (
    email: EmailSentByDay[]
  ): Promise<void> => {
    await client.index({
      index: dbName + emailSentByDayCollection,
      body: {
        emailSentCollection: email,
      },
    })
  }

  const insertCustodians = async (custodians: Custodian[]): Promise<void> => {
    custodians.forEach(async (custodian) => {
      await client.index({
        index: dbName + custodianCollection,
        id: custodian.id,
        body: {
          id: custodian.id,
          name: custodian.name,
          title: custodian.title,
          color: custodian.color,
          senderTotal: custodian.senderTotal,
          receiverTotal: custodian.receiverTotal,
          toCustodians: custodian.toCustodians,
        },
      })
    })
  }

  process.send(`drop database`)
  try {
    await client.indices.delete({ index: dbName + emailCollection })
    await client.indices.delete({ index: dbName + wordCloudCollection })
    await client.indices.delete({ index: dbName + emailSentByDayCollection })
    await client.indices.delete({ index: dbName + custodianCollection })
    await client.indices.delete({ index: dbName + searchHistoryCollection })
  } catch (error) {
    console.error(error)
  }

  process.send(`create index`)
  await client.indices.create({ index: dbName + emailCollection })
  await client.indices.create({ index: dbName + wordCloudCollection })
  await client.indices.create({ index: dbName + emailSentByDayCollection })
  await client.indices.create({ index: dbName + custodianCollection })
  await client.indices.create({ index: dbName + searchHistoryCollection })

  process.send(`process emails`)
  const numEmails = await walkFSfolder(process.argv[2], insertEmails, (msg) =>
    process.send(msg)
  )

  process.send(`process word cloud`)
  await processWordCloud(insertWordCloud, (msg) => process.send(msg))

  process.send(`process email sent`)
  await processEmailSentByDay(insertEmailSentByDay, (msg) => process.send(msg))

  process.send(`process custodians`)
  await processCustodians(insertCustodians, (msg) => process.send(msg))

  process.send(`refresh index`)
  await client.indices.refresh({ index: dbName + emailCollection })
  await client.indices.refresh({ index: dbName + wordCloudCollection })
  await client.indices.refresh({ index: dbName + emailSentByDayCollection })
  await client.indices.refresh({ index: dbName + custodianCollection })

  process.send(`completed ${numEmails} emails in ${process.argv[2]}`)
}

run().catch((err) => console.error(err))
