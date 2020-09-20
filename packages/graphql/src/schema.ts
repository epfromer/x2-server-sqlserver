import { buildSchema } from 'graphql'

const schema = buildSchema(`
  type Word {
    tag: String
    weight: Int
  }
  type Query {
    getWord(word: String): Word
    getWordCloud: [Word]
  }
`)

export default schema
