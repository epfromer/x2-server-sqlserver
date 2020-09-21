import { buildSchema } from 'graphql'

export const graphqlSchema = buildSchema(`
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

  type EmailTotal {
    emails: [Email]
    total: Int
  }

  type Query {
    wordcloud: [Word]
    emailsentbyday: [EmailSentByDay]
    custodians: [Custodian]
    email(id: ID, skip: Int, limit: Int = 20): EmailTotal
  }
`)
