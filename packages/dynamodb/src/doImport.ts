import { dbName, emailCollection } from '@klonzo/common'
import * as aws from 'aws-sdk'
import * as dotenv from 'dotenv'
dotenv.config()

// https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_CreateTable.html

async function run() {
  process.send(`connect to dynamodb`)
  aws.config.update({ region: 'REGION' })
  const client = new aws.DynamoDB({ endpoint: process.env.AWS_HOST })

  // const insertEmails = async (email: Email[]): Promise<void> => {
  //   await db.collection(emailCollection).insertMany(email)
  // }

  // const insertWordCloud = async (wordCloud: WordCloudTag[]): Promise<void> => {
  //   await db.collection(wordCloudCollection).insertMany(wordCloud)
  // }

  // const insertEmailSentByDay = async (
  //   emailSentByDay: EmailSentByDay[]
  // ): Promise<void> => {
  //   await db.collection(emailSentByDayCollection).insertMany(emailSentByDay)
  // }

  // const insertCustodians = async (Custodians: Custodian[]): Promise<void> => {
  //   await db.collection(custodianCollection).insertMany(Custodians)
  // }

  process.send(`drop database`)
  await client
    .deleteTable({ TableName: dbName + emailCollection })
    .promise()
    .catch(() => console.error)
  await client
    .waitFor('tableNotExists', { TableName: dbName + emailCollection })
    .promise()

  process.send(`create database`)
  const tableDefinition = {
    AttributeDefinitions: [{ AttributeName: '_id', AttributeType: 'S' }],
    KeySchema: [{ AttributeName: '_id', KeyType: 'HASH' }],
    ProvisionedThroughput: {
      ReadCapacityUnits: 1,
      WriteCapacityUnits: 2,
    },
    StreamSpecification: {
      StreamEnabled: false,
    },
    TableName: dbName + emailCollection,
  }
  await client.createTable(tableDefinition).promise()
  await client
    .waitFor('tableExists', { TableName: dbName + emailCollection })
    .promise()

  // process.send(`process emails`)
  // const numEmails = await walkFSfolder(insertEmails, (msg) => process.send(msg))

  // process.send(`process word cloud`)
  // await processWordCloud(insertWordCloud, (msg) => process.send(msg))

  // process.send(`process email sent`)
  // await processEmailSentByDay(insertEmailSentByDay, (msg) => process.send(msg))

  // process.send(`create custodians`)
  // await processCustodians(insertCustodians, (msg) => process.send(msg))

  // process.send(`create index`)
  // await db.collection(emailCollection).createIndex({ '$**': 'text' })

  // process.send(`completed ${numEmails} emails`)
  // client.close()
  console.log('complete')
}

run().catch((err) => console.error(err))
