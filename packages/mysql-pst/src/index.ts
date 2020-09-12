import {
  Custodian,
  custodianCollection,
  dbName,
  Email,
  emailCollection,
  EmailSentByDay,
  emailSentByDayCollection,
  processCustodians,
  processEmailSentByDay,
  processWordCloud,
  walkFSfolder,
  wordCloudCollection,
  WordCloudTag,
} from '@klonzo/common'
import * as dotenv from 'dotenv'
import { v4 as uuidv4 } from 'uuid'

dotenv.config()

// http://localhost:8983/solr/#/
// https://lucene.apache.org/solr/guide/

// const insertEmails = async (emails: Email[]): Promise<void> => {}

// const insertWordCloud = async (wordCloud: WordCloudTag[]): Promise<void> => {}

// const insertEmailSentByDay = async (
//   emailSentByDay: EmailSentByDay[]
// ): Promise<void> => {}

// const insertCustodians = async (custodians: Custodian[]): Promise<void> => {}

async function run() {
  // console.log(`drop database`)
  // try {
  // } catch (err) {
  //   console.error(err)
  // }

  console.log(`create database`)
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const solr = require('solr-client')
  const client = solr.createClient()
  client.basicAuth('admin', 'passtest')
  client.add({ id: 12, title_t: 'Hello' }, function (err, obj) {
    if (err) {
      console.log(err)
    } else {
      console.log('Solr response:', obj)
    }
  })

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
