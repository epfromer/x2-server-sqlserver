import {
  Custodian,
  EmailSentByDay,
  testCustodians,
  testEmailSentByDay,
  testWordCloud,
  WordCloudTag,
} from '@klonzo/common'

interface Root {
  wordcloud: () => Array<WordCloudTag>
  emailsentbyday: () => Array<EmailSentByDay>
  custodians: () => Array<Custodian>
}
export const root: Root = {
  wordcloud: () => testWordCloud,
  emailsentbyday: () => testEmailSentByDay,
  custodians: () => testCustodians,
}

export default root
