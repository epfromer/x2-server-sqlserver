/* eslint-disable @typescript-eslint/no-explicit-any */
/*
  Pulls email out of PSTs and stores in MongoDB.
*/
import * as config from 'config'
import * as fs from 'fs'
import * as mongodb from 'mongodb'
import { PSTFile, PSTFolder, PSTMessage } from 'pst-extractor'
import { v4 as uuidv4 } from 'uuid'
import * as moment from 'moment'

const MongoClient = mongodb.MongoClient
const pstFolder: string = config.get('pstFolder')
let numEmails = 0
let client: any
let db: any
const hashMap = new Map()
const statsMap = new Map()

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
  Create has to dedupe.
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
                sent +
                  ' From: ' +
                  from +
                  ', To: ' +
                  to +
                  ', Subject: ' +
                  subject
              )
            }

            // todo: x2-vue, react use emails (not lstDocs) and id not _id
            // add to stats
            const day = moment(sent).format().slice(0, 10)
            if (statsMap.has(day)) {
              statsMap.get(day).push(id)
            } else {
              statsMap.set(day, [id])
            }

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
 * Process stats list to store in db.
 */
interface StatsDoc {
  sent: string
  ids: string[]
}
async function processStatsMap(): Promise<any> {
  const arr: StatsDoc[] = []
  statsMap.forEach((value, key) => arr.push({ sent: key, ids: value }))
  await db.collection(config.get('dbStatsCollection')).insertMany(arr)
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
    processStatsMap()

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
