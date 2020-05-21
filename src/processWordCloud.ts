/* eslint-disable @typescript-eslint/no-var-requires */
import * as config from 'config'
import { PSTMessage } from 'pst-extractor'
import { db } from './index'
import { keyTerms } from './keyTerms'
const sw = require('stopword')

// TODO investigate https://www.npmjs.com/package/natural

const wordCloudMap = new Map()

interface WordCloudDoc {
  tag: string
  weight: number
}

// Tokenize body for word cloud
export function addToWordCloud(email: PSTMessage): void {
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
    if (wordCloudMap.has(term)) {
      wordCloudMap.set(term, wordCloudMap.get(term) + 1)
    }
  })
}

// Process list for word cloud and store in db.
export async function processWordCloud(): Promise<any> {
  const arr: WordCloudDoc[] = []
  wordCloudMap.forEach((v, k) => {
    arr.push({ tag: k, weight: v })
  })
  console.log('processWordCloud: ' + arr.length + ' terms')
  await db.collection(config.get('dbWordCloudCollection')).insertMany(arr)
}

// Initialize key terms map
keyTerms.forEach((term) => wordCloudMap.set(term.toLowerCase(), 0))
