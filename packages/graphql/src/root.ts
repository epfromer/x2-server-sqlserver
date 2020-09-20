import { wordCloud } from './data'
import { WordCloudTag } from '@klonzo/common'

interface Root {
  getWord: ({ word: string }) => WordCloudTag
  getWordCloud: () => Array<WordCloudTag>
}
export const root: Root = {
  getWord: ({ word }) => wordCloud.find((w) => w.tag === word),
  getWordCloud: () => wordCloud,
}

export default root
