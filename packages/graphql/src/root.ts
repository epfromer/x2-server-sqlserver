import { testWordCloud, WordCloudTag } from '@klonzo/common'

interface Root {
  wordcloud: () => Array<WordCloudTag>
}
export const root: Root = {
  wordcloud: () => testWordCloud,
}

export default root
