import { buildSchema } from 'graphql'

const schema = buildSchema(`
  type Word {
    tag: String
    weight: Int
  }

  type EmailSentByDay {
    sent: String
    emailIds: [String]
  }

  type Query {
    wordcloud: [Word]
    emailsentbyday: [EmailSentByDay]
  }
`)

export default schema
