/* eslint-disable @typescript-eslint/no-explicit-any */
import * as config from 'config'
import * as fs from 'fs'
import * as mongodb from 'mongodb'
import { PSTFile, PSTFolder, PSTMessage } from 'pst-extractor'
import { v4 as uuidv4 } from 'uuid'
import { hash, hashMap } from './hash'
import { msString } from './msString'
import { addToStatsContacts } from './statsContacts'
import { addToStatsEmailSent, processStatsEmailSentMap } from './statsEmailSent'
import { addToStatsWordCloud, processStatsWordCloudMap } from './statsWordCloud'

const MongoClient = mongodb.MongoClient
const pstFolder: string = config.get('pstFolder')
let numEmails = 0
let client: any
export let db: any

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

// Processes individual email and stores in list.
function processEmail(email: PSTMessage, emails: EmailDoc[]): void {
  const massageFrom = (email: PSTMessage): string => {
    let from = email.senderName
    if (
      from !== email.senderEmailAddress &&
      email.senderEmailAddress.indexOf('IMCEANOTES') < 0
    ) {
      from += ' (' + email.senderEmailAddress + ')'
    }
    return from
  }

  const isValidEmail = (email: PSTMessage): boolean | null =>
    email.messageClass === 'IPM.Note' &&
    email.clientSubmitTime != null &&
    email.clientSubmitTime > new Date(1990, 0, 1) &&
    email.senderName.trim() != '' &&
    email.displayTo.trim() != ''

  if (!isValidEmail(email)) return

  // dedupe
  const h = hash(email.body)
  if (hashMap.has(h)) return
  hashMap.set(h, email.body)

  const id = uuidv4()
  const bcc = email.displayBCC
  const cc = email.displayCC
  const subject = email.subject
  const body = email.body
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const sent = email.clientSubmitTime!
  const to = email.displayTo
  const from = massageFrom(email)

  if (config.get('verbose')) {
    console.log(`${sent} From: ${from}, To: ${to}, Subject: ${subject}`)
  }

  // add to stats
  addToStatsContacts(to, from, id)
  addToStatsEmailSent(sent, id)
  addToStatsWordCloud(body)

  emails.push({ id, sent, from, to, cc, bcc, subject, body })
}

// Walk the folder tree recursively and process emails, storing in email list.
function walkFolder(emails: EmailDoc[], folder: PSTFolder): void {
  if (folder.hasSubfolders) {
    const childFolders: PSTFolder[] = folder.getSubFolders()
    for (const childFolder of childFolders) {
      walkFolder(emails, childFolder)
    }
  }

  if (folder.contentCount > 0) {
    let email: PSTMessage = folder.getNextChild()
    while (email != null) {
      processEmail(email, emails)
      email = folder.getNextChild()
    }
  }
}

// Processes a PST, storing emails in list.
function walkPST(filename: string): EmailDoc[] {
  const emails: EmailDoc[] = []
  const pstFile = new PSTFile(filename)
  walkFolder(emails, pstFile.getRootFolder())
  return emails
}

// Process email list to store in db.
async function processEmailList(emailList: EmailDoc[]): Promise<any> {
  await db.collection(config.get('dbEmailCollection')).insertMany(emailList)
}

// Main async app that walks list of PSTs and processes them.
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
      console.log(`processing ${file}\n`)
      const processStart = Date.now()
      const emails = walkPST(pstFolder + file)
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
