import { Client } from '@elastic/elasticsearch'
import {
  Custodian,
  custodianCollection,
  dbName,
  EmailSentByDay,
  emailSentByDayCollection,
  EmailTotal,
  HTTPQuery,
  ImportLogEntry,
  wordCloudCollection,
  WordCloudTag,
} from '@klonzo/common'
import { getEmail } from './getEmail'
import { getImportStatus, importPST } from './importPST'

const getWordCloud = async (): Promise<Array<WordCloudTag>> => {
  try {
    const client = new Client({
      node: `http://${process.env.ELASTIC_HOST}:${process.env.ELASTIC_PORT}`,
    })
    const { body } = await client.search({
      index: dbName + wordCloudCollection,
      q: '*',
    })
    return body.hits.hits[0]._source.wordCloudCollection
  } catch (err) {
    console.error(err.stack)
  }
}

const getEmailSentByDay = async (): Promise<Array<EmailSentByDay>> => {
  try {
    const client = new Client({
      node: `http://${process.env.ELASTIC_HOST}:${process.env.ELASTIC_PORT}`,
    })
    const { body } = await client.search({
      index: dbName + emailSentByDayCollection,
      q: '*',
    })
    return body.hits.hits[0]._source.emailSentCollection
  } catch (err) {
    console.error(err.stack)
  }
}

const getCustodians = async (): Promise<Array<Custodian>> => {
  try {
    const client = new Client({
      node: `http://${process.env.ELASTIC_HOST}:${process.env.ELASTIC_PORT}`,
    })
    const { body } = await client.search({
      index: dbName + custodianCollection,
      q: '*',
      sort: 'id.keyword:asc',
    })
    return body.hits.hits.map((custodian) => ({
      id: custodian._source.id,
      name: custodian._source.name,
      title: custodian._source.title,
      color: custodian._source.color,
      senderTotal: custodian._source.senderTotal,
      receiverTotal: custodian._source.receiverTotal,
      toCustodians: custodian._source.toCustodians,
      fromCustodians: custodian._source.fromCustodians,
    }))
  } catch (err) {
    console.error(err.stack)
  }
}

const setCustodianColor = async (
  httpQuery: HTTPQuery
): Promise<Array<Custodian>> => {
  const client = new Client({
    node: `http://${process.env.ELASTIC_HOST}:${process.env.ELASTIC_PORT}`,
  })
  await client.update({
    index: dbName + custodianCollection,
    id: httpQuery.id,
    body: {
      doc: {
        color: httpQuery.color,
      },
    },
  })
  await client.indices.refresh({ index: dbName + custodianCollection })
  const { body } = await client.search({
    index: dbName + custodianCollection,
    q: '*',
    sort: 'id.keyword:asc',
  })
  return body.hits.hits.map((custodian) => ({
    id: custodian._source.id,
    name: custodian._source.name,
    title: custodian._source.title,
    color: custodian._source.color,
    senderTotal: custodian._source.senderTotal,
    receiverTotal: custodian._source.receiverTotal,
    toCustodians: custodian._source.toCustodians,
    fromCustodians: custodian._source.fromCustodians,
  }))
}

interface Root {
  importPST: (httpQuery) => string
  getImportStatus: () => Array<ImportLogEntry>
  getWordCloud: () => Promise<Array<WordCloudTag>>
  getEmailSentByDay: () => Promise<Array<EmailSentByDay>>
  getCustodians: () => Promise<Array<Custodian>>
  getEmail: (httpQuery: HTTPQuery) => Promise<EmailTotal>
  setCustodianColor: (httpQuery: HTTPQuery) => Promise<Array<Custodian>>
}
export const root: Root = {
  importPST: (httpQuery) => importPST(httpQuery),
  getImportStatus: () => getImportStatus(),
  getWordCloud: () => getWordCloud(),
  getEmailSentByDay: () => getEmailSentByDay(),
  getCustodians: () => getCustodians(),
  getEmail: (httpQuery) => getEmail(httpQuery),
  setCustodianColor: (httpQuery) => setCustodianColor(httpQuery),
}

export default root
