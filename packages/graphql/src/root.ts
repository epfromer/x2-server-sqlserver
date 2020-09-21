import {
  Custodian,
  Email,
  EmailSentByDay,
  testCustodians,
  testEmail,
  testEmailSentByDay,
  testWordCloud,
  WordCloudTag,
} from '@klonzo/common'

interface EmailTotal {
  emails: Array<Email>
  total: number
}

interface Root {
  wordcloud: () => Array<WordCloudTag>
  emailsentbyday: () => Array<EmailSentByDay>
  custodians: () => Array<Custodian>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  email: (foo: any) => EmailTotal
}
export const root: Root = {
  wordcloud: () => testWordCloud,
  emailsentbyday: () => testEmailSentByDay,
  custodians: () => testCustodians,
  email: (foo) => {
    console.log('foo', foo)
    return { emails: testEmail, total: 3 }
  },
}

export default root
