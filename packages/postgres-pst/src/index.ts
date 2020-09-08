import {
  Custodian,
  custodianCollection,
  dbName,
  Email,
  emailCollection,
  EmailSentByDay,
  emailSentByDayCollection,
  mongodbServer,
  processCustodians,
  processEmailSentByDay,
  processWordCloud,
  walkFSfolder,
  wordCloudCollection,
  WordCloudTag,
} from '@klonzo/common'

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

async function run() {
  console.log(process.env.PGUSER)

  // console.log(`connect to ${mongodbServer}`)
  // const client = await mongodb.MongoClient.connect(mongodbServer, {
  //   useUnifiedTopology: false,
  // })
  // db = client.db(dbName)

  // console.log(`drop database`)
  // await db.dropDatabase()

  // console.log(`insert emails`)
  // const numEmails = await walkFSfolder(insertEmails)

  // console.log(`insert word cloud`)
  // await processWordCloud(insertWordCloud)

  // console.log(`insert email sent`)
  // await processEmailSentByDay(insertEmailSentByDay)

  // console.log(`insert custodians`)
  // await processCustodians(insertCustodians)

  // console.log(`create index`)
  // await db.collection(emailCollection).createIndex({ '$**': 'text' })

  // console.log(`completed ${numEmails} emails`)
}

run().catch(console.error)
