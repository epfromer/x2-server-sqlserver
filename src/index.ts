/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-explicit-any */
/*
  Pulls email out of PSTs and stores in MongoDB.
*/
import * as config from 'config'
import * as fs from 'fs'
import * as mongodb from 'mongodb'
import { PSTFile, PSTFolder, PSTMessage } from 'pst-extractor'
import { v4 as uuidv4 } from 'uuid'
const occurrences = require('occurences')
const sw = require('stopword')

const MongoClient = mongodb.MongoClient
const pstFolder: string = config.get('pstFolder')
let numEmails = 0
let client: any
let db: any
const hashMap = new Map()
const statsEmailSentMap = new Map()
const statsWordCloudMap = new Map()

const WORD_CLOUD_THRESHOLD = 250

// todo: get smarter at TS to put this into other file
const commonWords = [
  'international',
  'available',
  'opportunity',
  'program',
  'available',
  'number',
  'again',
  'working',
  'compaq',
  'new',
  'part',
  'first',
  'few',
  'david',
  'center',
  'best',
  'today',
  'corp',
  'news',
  'during',
  'web',
  'york',
  'michael',
  'the',
  'reports',
  'mark',
  'place',
  'street',
  'committee',
  'attend',
  'you',
  'subject',
  'address',
  'home',
  'members',
  'look',
  'think',
  'issues',
  'issue',
  'date',
  'jeff',
  'thank',
  'continue',
  'process',
  'believe',
  'doc',
  'current',
  'low',
  'possible',
  'hou',
  'wpo',
  'admin',
  'https',
  'indeed',
  'enewsletter',
  'nbsp',
  'want',
  'contact',
  'thanks',
  'time',
  'attached',
  'report',
  'know',
  'going',
  'top',
  'meet',
  'long',
  'john',
  'provide',
  'visit',
  'review',
  'plan',
  'office',
  'technology',
  'communications',
  'use',
  'team',
  'several',
  'its',
  'read',
  "don't",
  'give',
  'give',
  'need',
  'full',
  'does',
  'and',
  'fax',
  'list',
  'html',
  'let',
  'regards',
  'good',
  'great',
  'month',
  'around',
  'just',
  'off',
  'university',
  'will',
  'newsletter',
  'keep',
  'meeting',
  'when',
  'made',
  'mail',
  'yahoo',
  "company's",
  'receive',
  'able',
  'name',
  'development@enron',
  'ect@ect',
  'website',
  'not',
  'sincerely',
  'find',
  "enron's",
  'enron@enron',
  'images',
  'reach',
  'however',
  'www',
  'http',
  'com',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'one',
  'two',
  'three',
  'four',
  'january',
  'february',
  'march',
  'april',
  'may',
  'june',
  'july',
  'august',
  'september',
  'october',
  'november',
  'december',
  'day',
  'week',
  'next',
  'internet',
  'work',
  'company',
  'using',
  'send',
  'email',
  'sent',
  'across',
  'non',
  "it's",
  "i'm",
  'unsubscribe',
  'asp',
  'say',
  'better',
  'please',
  'year',
  'set',
  "can't",
  'org',
]

export interface EmailDoc {
  id: string
  sent: Date
  from: string
  to: string
  cc: string
  bcc: string
  subject: string
  body: string
}

function msString(numDocs: number, msStart: number, msEnd: number): string {
  const ms = msEnd - msStart
  const msPerDoc = ms / numDocs
  const sec = ms / 1000
  const min = sec / 60
  let s = ` ${numDocs} docs`
  s += `, ${ms} ms (~ ${Math.trunc(sec)} sec)`
  if (min > 1) {
    s += ` (~ ${Math.trunc(min)} min)`
  }
  s += `, ~ ${Math.trunc(msPerDoc)} ms per doc`
  return s
}

/*
  Create hash to dedupe.
*/
function hash(s: string): number {
  let h = 0,
    i,
    chr
  for (i = 0; i < s.length; i++) {
    chr = s.charCodeAt(i)
    h = (h << 5) - h + chr
    h |= 0 // Convert to 32bit integer
  }
  return h
}

/*
  Tokenize body for word cloud
*/
function tokenize(body: string): void {
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

/**
 * Walk the folder tree recursively and process emails, storing in email list.
 */
function processFolder(emails: EmailDoc[], folder: PSTFolder): void {
  // go through the folders...
  if (folder.hasSubfolders) {
    const childFolders: PSTFolder[] = folder.getSubFolders()
    for (const childFolder of childFolders) {
      processFolder(emails, childFolder)
    }
  }

  // and now the emails for this folder
  if (folder.contentCount > 0) {
    // get first in folder
    let email: PSTMessage = folder.getNextChild()
    while (email != null) {
      const oldestValidDate = new Date(1990, 0, 1)

      if (
        email.messageClass === 'IPM.Note' &&
        // filter out bad dates
        email.clientSubmitTime &&
        email.clientSubmitTime > oldestValidDate
      ) {
        // create hash to dedupe
        const h = hash(email.body)
        if (!hashMap.has(h)) {
          hashMap.set(h, email.body)

          const sent = email.clientSubmitTime
          let from = email.senderName
          if (
            from !== email.senderEmailAddress &&
            email.senderEmailAddress.indexOf('IMCEANOTES') < 0
          ) {
            from += ' (' + email.senderEmailAddress + ')'
          }
          const id = uuidv4()
          const to = email.displayTo
          const bcc = email.displayBCC
          const cc = email.displayCC
          const subject = email.subject
          const body = email.body

          if (sent && from && to) {
            if (config.get('verbose')) {
              console.log(
                `${sent} From: ${from}, To: ${to}, Subject: ${subject}`
              )
            }

            // todo: x2-vue, react use emails (not lstDocs) and id not _id
            // add to stats
            const day = sent.toISOString().slice(0, 10)
            if (statsEmailSentMap.has(day)) {
              statsEmailSentMap.get(day).push(id)
            } else {
              statsEmailSentMap.set(day, [id])
            }

            // tokenize for word cloud
            tokenize(body)

            emails.push({ id, sent, from, to, cc, bcc, subject, body })
          }
        }
      }

      // onto next
      email = folder.getNextChild()
    }
  }
}

/**
 * Processes a PST, storing emails in list.
 */
function processPST(filename: string): EmailDoc[] {
  const emails: EmailDoc[] = []
  const pstFile = new PSTFile(filename)

  processFolder(emails, pstFile.getRootFolder())

  return emails
}

/**
 * Process email list to store in db.
 */
async function processEmailList(emailList: EmailDoc[]): Promise<any> {
  await db.collection(config.get('dbEmailCollection')).insertMany(emailList)
}

/**
 * Process stats list for email sent and store in db.
 */
interface StatsEmailSentDoc {
  sent: string
  ids: string[]
}
async function processStatsEmailSentMap(): Promise<any> {
  const arr: StatsEmailSentDoc[] = []
  statsEmailSentMap.forEach((value, key) => arr.push({ sent: key, ids: value }))
  await db.collection(config.get('dbStatsEmailSentCollection')).insertMany(arr)
}

/**
 * Process stats list for word cloud and store in db.
 */
interface StatsWordCloudDoc {
  tag: string
  weight: number
}
async function processStatsWordCloudMap(): Promise<any> {
  const arr: StatsWordCloudDoc[] = []

  statsWordCloudMap.forEach((v, k) => {
    if (v > WORD_CLOUD_THRESHOLD) arr.push({ tag: k, weight: v })
  })
  console.log('processStatsWordCloudMap: ' + arr.length + ' terms')

  await db.collection(config.get('dbStatsWordCloudCollection')).insertMany(arr)
}

/**
 * Main async app that walks list of PSTs and processes them.
 */
;(async (): Promise<any> => {
  try {
    // connect to db
    console.log(`connecting to ${config.get('dbHost')}`)
    client = await MongoClient.connect(config.get('dbHost'))
    db = client.db(config.get('dbName'))
    console.log(`connected to ${config.get('dbHost')}`)

    // drop database if requested
    if (config.get('dropDatabase')) {
      console.log(`dropping database ${config.get('dbHost')}`)
      await db.dropDatabase()
    }

    // walk folder
    console.log(`walking folder ${pstFolder}`)
    const folderListing = fs.readdirSync(pstFolder)
    for (const file of folderListing) {
      // process a file
      console.log(`processing ${file}\n`)
      const processStart = Date.now()
      const emails = processPST(pstFolder + file)
      console.log(
        file +
          ': processing complete, ' +
          msString(emails.length, processStart, Date.now())
      )
      if (emails.length > 0) {
        // insert into db
        const dbInsertStart = Date.now()
        console.log(`inserting ${emails.length} documents`)
        processEmailList(emails)
        console.log(
          file +
            ': insertion complete, ' +
            msString(emails.length, dbInsertStart, Date.now())
        )
        numEmails += emails.length
      } else {
        console.log(file + ': processing complete, no emails')
      }
    }

    // process stats
    console.log('processing stats')
    processStatsEmailSentMap()
    processStatsWordCloudMap()

    // create indexes
    console.log('creating indexes')
    await db
      .collection(config.get('dbEmailCollection'))
      .createIndex({ '$**': 'text' })

    console.log(`${numEmails} emails processed`)
    // client.close();
  } catch (error) {
    console.error(error)
  }
})()
