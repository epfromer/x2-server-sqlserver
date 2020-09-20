import {
  testWordCloud,
  WordCloudTag,
  EmailSentByDay,
  testEmailSentByDay,
} from '@klonzo/common'

interface Root {
  wordcloud: () => Array<WordCloudTag>
  emailsentbyday: () => Array<EmailSentByDay>
}
export const root: Root = {
  wordcloud: () => testWordCloud,
  emailsentbyday: () => testEmailSentByDay,
}

export default root
