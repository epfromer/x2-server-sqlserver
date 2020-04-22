/* eslint-disable @typescript-eslint/no-explicit-any */
/*
  Pulls email out of PSTs and stores in MongoDB.
*/
import * as config from 'config'
import * as fs from 'fs'
import * as mongodb from 'mongodb'
import { PSTFile, PSTFolder, PSTMessage } from 'pst-extractor'

const MongoClient = mongodb.MongoClient
const pstFolder: string = config.get('pstFolder')
let numEmails = 0
let client: any
let db: any

export interface EmailDoc {
  body: string
  clientSubmitTime: Date
  displayBCC: string
  displayCC: string
  displayTo: string
  senderEmailAddress: string
  senderName: string
  subject: string
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

/**
 * Walk the folder tree recursively and process emails, storing in email list.
 */
function processFolder(docList: EmailDoc[], folder: PSTFolder): void {
  // go through the folders...
  if (folder.hasSubfolders) {
    const childFolders: PSTFolder[] = folder.getSubFolders()
    for (const childFolder of childFolders) {
      processFolder(docList, childFolder)
    }
  }

  // and now the emails for this folder
  if (folder.contentCount > 0) {
    // get first in folder
    let email: PSTMessage = folder.getNextChild()
    while (email != null) {
      // if an email
      if (email.messageClass === 'IPM.Note') {
        let sender = email.senderName
        if (sender !== email.senderEmailAddress) {
          sender += ' (' + email.senderEmailAddress + ')'
        }

        const recipients = email.displayTo

        if (config.get('verbose')) {
          console.log(
            email.clientSubmitTime +
              ' From: ' +
              sender +
              ', To: ' +
              recipients +
              ', Subject: ' +
              email.subject
          )
        }

        // trap bad dates (should do this in pst-extractor)
        let clientSubmitTime = email.clientSubmitTime
        if (!clientSubmitTime) {
          clientSubmitTime = new Date('1970/01/01')
        } else if (isNaN(clientSubmitTime.getTime())) {
          clientSubmitTime = new Date('1970/01/01')
        } else if (clientSubmitTime.getTime() > Date.now()) {
          clientSubmitTime = new Date('1970/01/01')
        }

        docList.push({
          body: email.body,
          clientSubmitTime,
          displayBCC: email.displayBCC,
          displayCC: email.displayCC,
          displayTo: email.displayTo,
          senderEmailAddress: email.senderEmailAddress,
          senderName: email.senderName,
          subject: email.subject,
        })
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
  const docList: EmailDoc[] = []
  const pstFile = new PSTFile(filename)

  processFolder(docList, pstFile.getRootFolder())

  return docList
}

/**
 * Process email list to store in db.
 */
async function processEmailList(emailList: EmailDoc[]): Promise<any> {
  await db.collection(config.get('dbCollection')).insertMany(emailList)
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
      const docList = processPST(pstFolder + file)
      console.log(
        file +
          ': processing complete, ' +
          msString(docList.length, processStart, Date.now())
      )
      if (docList.length > 0) {
        // insert into db
        const dbInsertStart = Date.now()
        console.log(`inserting ${docList.length} documents`)
        processEmailList(docList)
        console.log(
          file +
            ': insertion complete, ' +
            msString(docList.length, dbInsertStart, Date.now())
        )
        numEmails += docList.length
      } else {
        console.log(file + ': processing complete, no emails')
      }
    }

    // create indexes
    console.log('creating indexes')
    await db
      .collection(config.get('dbCollection'))
      .createIndex({ '$**': 'text' })

    console.log(`${numEmails} emails processed`)
    // client.close();
  } catch (error) {
    console.error(error)
  }
})()
