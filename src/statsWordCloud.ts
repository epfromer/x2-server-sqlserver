/* eslint-disable @typescript-eslint/no-var-requires */
import * as config from 'config'
import { PSTMessage } from 'pst-extractor'
import { db } from './index'
const sw = require('stopword')

// TODO investigate https://www.npmjs.com/package/natural

// https://books.google.com/books?id=CeapJz_amLUC&pg=SL1-PA25&lpg=SL1-PA25&dq=enron+glossary&source=bl&ots=ZIvVX780A0&sig=ACfU3U1As4CgzXi4THiPraSuiTeh_vVpjg&hl=en&sa=X&ved=2ahUKEwiVypmsga_pAhWHsJ4KHXCbDfcQ6AEwCHoECAoQAQ#v=onepage&q=enron%20glossary&f=false

const keyTerms = [
  'Avici',
  'Azurix',
  'Braveheart',
  'Catalytica',
  'Cuiaba',
  'Merlin',
  'Merlin',
  'Osprey',
  'Rawhide',
  'Southampton',
  'apache',
  'bammel',
  'bankrupt',
  'bankruptcy',
  'bobcat',
  'california',
  'campsie',
  'cayman',
  'chewco',
  'condor',
  'criminal',
  'death',
  'deathstar',
  'electricity',
  'fat',
  'fraud',
  'fuck',
  'granite',
  'grizzly',
  'harrier',
  'herron',
  'jedi',
  'litigation',
  'ljm',
  'ljm1',
  'ljm2',
  'mahonia',
  'maliseet',
  'mangas',
  'monopoly',
  'ojibway',
  'oregon',
  'porcupine',
  'pronghorn',
  'raptor',
  'raptors',
  'renegade',
  'retirement',
  'ricochet',
  'roadrunner',
  'shorty',
  'shutdown',
  'sidewinder',
  'snohomish',
  'stanley',
  'star',
  'steele',
  'swap',
  'talon',
  'tammy',
  'teresa',
  'timberwolf',
  'tonya',
  'trutta',
  'tularosa',
  'valhalla',
  'valkyrie',
  'valor',
  'velocity',
  'whitewing',
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
