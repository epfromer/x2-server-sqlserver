import {
  Custodian,
  dbName,
  Email,
  EmailSentByDay,
  testCustodians,
  testEmail,
  testEmailSentByDay,
  wordCloudCollection,
  WordCloudTag,
} from '@klonzo/common'
import * as mongodb from 'mongodb'

const getWordCloud = async (): Promise<Array<WordCloudTag>> => {
  try {
    const client = await mongodb.MongoClient.connect(process.env.MONGODB_HOST, {
      useUnifiedTopology: false,
    })
    const db = client.db(dbName)
    const wordCloud = await db.collection(wordCloudCollection).find().toArray()
    return wordCloud.map((word) => ({ tag: word.tag, weight: word.weight }))
  } catch (err) {
    console.error(err.stack)
  }
}

interface EmailTotal {
  emails: Array<Email>
  total: number
}
interface Root {
  wordcloud: () => Promise<Array<WordCloudTag>>
  emailsentbyday: () => Array<EmailSentByDay>
  custodians: () => Array<Custodian>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  email: (foo: any) => Promise<EmailTotal>
}
export const root: Root = {
  wordcloud: () => getWordCloud(),
  emailsentbyday: () => testEmailSentByDay,
  custodians: () => testCustodians,
  email: async (foo) => {
    console.log('foo', foo)
    return { emails: testEmail, total: testEmail.length }
  },
}

export default root
