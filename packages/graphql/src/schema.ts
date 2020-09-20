import { buildSchema } from 'graphql'

const schema = buildSchema(`
  type Word {
    tag: String
    weight: Int
  }
  type Query {
    wordcloud: [Word]
  }
`)

export default schema
