import {
  Custodian,
  custodianCollection,
  dbName,
  EmailSentByDay,
  emailSentByDayCollection,
  EmailTotal,
  HTTPQuery,
  ImportLogEntry,
  SearchHistoryEntry,
  wordCloudCollection,
  WordCloudTag,
} from '@klonzo/common'
import redis from 'redis'
import { promisify } from 'util'
import { getEmail } from './getEmail'
import { getImportStatus, importPST } from './importPST'
import { clearSearchHistory, getSearchHistory } from './searchHistory'

// https://oss.redislabs.com/redisearch/Commands.html#ftget
const client = redis.createClient()
const ftGetAsync = promisify(client.ft_get).bind(client)
const ftAddAsync = promisify(client.ft_add).bind(client)

const getWordCloud = async (): Promise<Array<WordCloudTag>> => {
  try {
    const docArr = await ftGetAsync([dbName + wordCloudCollection, 'wordcloud'])
    return JSON.parse(docArr[1])
  } catch (err) {
    console.error(err.stack)
  }
}

const getEmailSentByDay = async (): Promise<Array<EmailSentByDay>> => {
  try {
    const docArr = await ftGetAsync([
      dbName + emailSentByDayCollection,
      'emailSentByDay',
    ])
    return JSON.parse(docArr[1])
  } catch (err) {
    console.error(err.stack)
  }
}

const getCustodians = async (): Promise<Array<Custodian>> => {
  try {
    const docArr = await ftGetAsync([
      dbName + custodianCollection,
      'custodians',
    ])
    return JSON.parse(docArr[1])
  } catch (err) {
    console.error(err.stack)
  }
}

const setCustodianColor = async (
  httpQuery: HTTPQuery
): Promise<Array<Custodian>> => {
  let docArr = await ftGetAsync([dbName + custodianCollection, 'custodians'])
  const custodians = JSON.parse(docArr[1]).map((custodian) => {
    if (custodian.id === httpQuery.id) custodian.color = httpQuery.color
    return custodian
  })
  await ftAddAsync([
    dbName + custodianCollection,
    'custodians',
    1.0,
    'REPLACE',
    'FIELDS',
    'custodians',
    JSON.stringify(custodians),
  ])
  docArr = await ftGetAsync([dbName + custodianCollection, 'custodians'])
  return JSON.parse(docArr[1])
}

interface Root {
  clearSearchHistory: () => Promise<string>
  getCustodians: () => Promise<Array<Custodian>>
  getEmail: (httpQuery: HTTPQuery) => Promise<EmailTotal>
  getEmailSentByDay: () => Promise<Array<EmailSentByDay>>
  getImportStatus: () => Array<ImportLogEntry>
  getSearchHistory: () => Promise<Array<SearchHistoryEntry>>
  getWordCloud: () => Promise<Array<WordCloudTag>>
  importPST: (httpQuery) => string
  setCustodianColor: (httpQuery: HTTPQuery) => Promise<Array<Custodian>>
}
export const root: Root = {
  clearSearchHistory: () => clearSearchHistory(),
  getCustodians: () => getCustodians(),
  getEmail: (httpQuery) => getEmail(httpQuery),
  getEmailSentByDay: () => getEmailSentByDay(),
  getImportStatus: () => getImportStatus(),
  getSearchHistory: () => getSearchHistory(),
  getWordCloud: () => getWordCloud(),
  importPST: (httpQuery) => importPST(httpQuery),
  setCustodianColor: (httpQuery) => setCustodianColor(httpQuery),
}

export default root
