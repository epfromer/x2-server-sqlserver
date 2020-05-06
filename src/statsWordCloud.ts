/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-var-requires */
import * as config from 'config'
import { db } from './index'
import { commonWords } from './statsCommonWords'
const occurrences = require('occurences')
const sw = require('stopword')

const statsWordCloudMap = new Map()

// mininum number of mentions to warrant place in cloud
const WORD_CLOUD_THRESHOLD = 250

interface StatsWordCloudDoc {
  tag: string
  weight: number
}

// Tokenize body for word cloud
export function addToStatsWordCloud(body: string): void {
  // remove EDRM sig
  const zlSig = '***********'
  let cleanBody = body.slice(0, body.indexOf(zlSig))

  // remove CR/LF
  cleanBody = cleanBody.replace(/[\r\n\t]/g, ' ')

  // remove stopwords (common words that don't afffect meaning)
  const cleanArr = cleanBody.split(' ')
  cleanBody = sw.removeStopwords(cleanArr).join(' ')

  // tokenize to terms, ignoring common
  const ignored = commonWords
  const tokens = new occurrences(cleanBody, { ignored })

  // console.log(tokens)
  // throw 'foo'

  // put into word cloud map
  Object.entries(tokens._stats).map(([k, v]) => {
    if (statsWordCloudMap.has(k)) {
      statsWordCloudMap.set(k, statsWordCloudMap.get(k) + v)
    } else {
      statsWordCloudMap.set(k, v)
    }
  })
}

// Process stats list for word cloud and store in db.
export async function processStatsWordCloudMap(): Promise<any> {
  const arr: StatsWordCloudDoc[] = []
  statsWordCloudMap.forEach((v, k) => {
    if (v > WORD_CLOUD_THRESHOLD) arr.push({ tag: k, weight: v })
  })
  console.log('processStatsWordCloudMap: ' + arr.length + ' terms')
  await db.collection(config.get('dbStatsWordCloudCollection')).insertMany(arr)
}
