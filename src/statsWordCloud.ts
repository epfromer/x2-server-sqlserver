/* eslint-disable @typescript-eslint/no-var-requires */
import * as config from 'config'
import { PSTMessage } from 'pst-extractor'
import { db } from './index'
const sw = require('stopword')

const keyTerms = [
  'Avici',
  'Azurix',
  'Braveheart',
  'Cuiaba',
  'Merlin',
  'Osprey',
  'Osprey1',
  'Rawhide',
  'Southampton',
  'bankrupt',
  'bankruptcy',
  'cayman',
  'chewco',
  'condor',
  'death',
  'deathstar',
  'enron',
  'exectricity',
  'fat',
  'fraud',
  'fuck',
  'jedi',
  'litigation',
  'ljm',
  'ljm2',
  'monopoly',
  'raptor',
  'rocochet',
  'shorty',
  'shutdown',
  'sidewinder',
  'stanley',
  'star',
  'trutta',
  'velocity',
  'whitewing',
  'worthless',
]
const statsWordCloudMap = new Map()

interface StatsWordCloudDoc {
  tag: string
  weight: number
}

// Tokenize body for word cloud
export function addToStatsWordCloud(email: PSTMessage): void {
  // remove EDRM sig
  const zlSig = '***********'
  let cleanBody = email.body.slice(0, email.body.indexOf(zlSig))

  // remove CR/LF and lowercase
  cleanBody = cleanBody.replace(/[\r\n\t]/g, ' ').toLowerCase()

  // remove stopwords (common words that don't affect meaning)
  let cleanArr = cleanBody.split(' ')
  cleanArr = sw.removeStopwords(cleanArr)

  // bump counts for any term in our key terms
  cleanArr.forEach((term) => {
    if (statsWordCloudMap.has(term)) {
      statsWordCloudMap.set(term, statsWordCloudMap.get(term) + 1)
    }
  })
}

// Process stats list for word cloud and store in db.
export async function processStatsWordCloudMap(): Promise<any> {
  const arr: StatsWordCloudDoc[] = []
  statsWordCloudMap.forEach((v, k) => {
    arr.push({ tag: k, weight: v })
  })
  console.log('processStatsWordCloudMap: ' + arr.length + ' terms')
  await db.collection(config.get('dbStatsWordCloudCollection')).insertMany(arr)
}

// Initialize key terms map
keyTerms.forEach((term) => statsWordCloudMap.set(term.toLowerCase(), 0))
