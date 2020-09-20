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

  type EmailSentToCustodians {
    emailId: String
    custodianIds: [String]
  }
  
  type EmailReceivedFromCustodians {
    emailId: String
    custodianId: String
  }

  type Custodian {
    id: String
    name: String
    title: String
    color: String
    senderTotal: Int
    receiverTotal: Int
    toCustodians: [EmailSentToCustodians]
    fromCustodians: [EmailReceivedFromCustodians]
  }

  type Email {
    id: ID
    sent: String
    sentShort: String
    from: String
    fromCustodian: String
    to: String
    toCustodians: [String]
    cc: String
    bcc: String
    subject: String
    body: String
  }

  type Query {
    wordcloud: [Word]
    emailsentbyday: [EmailSentByDay]
    custodians: [Custodian]
  }
`)

export default schema
