/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  DB_NAME,
  MONGODB_SERVER,
  PST_FOLDER,
  EMAIL_COLLECTION,
} from '@klonzo/common'
import * as fs from 'fs'
import * as mongodb from 'mongodb'
import { msString } from './msString'
import { processContacts } from './processContacts'
import { possibleContacts } from './processEmail'
import { processEmailList } from './processEmailList'
import { processEmailSent } from './processEmailSent'
import { processWordCloud } from './processWordCloud'
import { walkPST } from './walkPST'

export let db: any
export let log: any

  // Main async app that walks list of PSTs and processes them.
;(async (): Promise<any> => {
  let numEmails = 0

  try {
    console.log(`connecting to ${MONGODB_SERVER}`)
    // const client = await mongodb.MongoClient.connect(MONGODB_SERVER, {
    //   useUnifiedTopology: true,
    // })
    const client = await mongodb.MongoClient.connect(MONGODB_SERVER)
    db = client.db(DB_NAME)
    console.log(`connected to ${MONGODB_SERVER}`)

    console.log(`dropping database ${MONGODB_SERVER}`)
    await db.dropDatabase()

    console.log(`walking folder ${PST_FOLDER}`)
    const folderListing = fs.readdirSync(PST_FOLDER)
    for (const file of folderListing) {
      console.log(`processing ${file}\n`)
      const processStart = Date.now()
      const emails = walkPST(PST_FOLDER + file)
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

    // ignored contacts
    // ignoredContacts.forEach((c) => console.log('ignored: ' + c))
    possibleContacts.forEach((c) => console.log(`'${c}',`))

    console.log('processing stats')
    processContacts()
    processEmailSent()
    processWordCloud()

    console.log('creating indexes')
    await db.collection(EMAIL_COLLECTION).createIndex({ '$**': 'text' })

    console.log(`${numEmails} emails processed`)
    // client.close();
  } catch (error) {
    console.error(error)
  }
})()
