"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.graphqlSchema = void 0;
const graphql_1 = require("graphql");
exports.graphqlSchema = (0, graphql_1.buildSchema)(`
  type Word {
    tag: String
    weight: Int
  }

  type EmailSentByDay {
    sent: String
    total: Int
  }

  type CustodianInteractions {
    custodianId: String
    total: Int
  }

  type Custodian {
    id: String
    name: String
    title: String
    color: String
    senderTotal: Int
    receiverTotal: Int
    toCustodians: [CustodianInteractions]
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

  type ImportLogEntry {
    id: String
    timestamp: String
    entry: String
  }

  type SearchHistoryEntry {
    id: String
    timestamp: String
    entry: String
  }

  type Mutation {
    clearSearchHistory: String
    importPST(loc: String): String
    setCustodianColor(id: ID, color: String): [Custodian]
  }

  type Query {
    getImportStatus: [ImportLogEntry]
    getWordCloud: [Word]
    getEmailSentByDay: [EmailSentByDay]
    getCustodians: [Custodian]
    getSearchHistory: [SearchHistoryEntry]
    getEmail(
      id: ID, 
      skip: Int = 0, 
      limit: Int = 20, 
      sort: String = "sent", 
      order: Int = 1, 
      sent: String,
      allText: String
      from: String
      to: String
      subject: String
      body: String
      ): EmailTotal
  }
`);
//# sourceMappingURL=graphqlSchema.js.map