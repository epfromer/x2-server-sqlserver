/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  dbName,
  mongodbServer,
  pstFolder,
  emailCollection,
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
    console.log(`connecting to ${mongodbServer}`)
    // const client = await mongodb.MongoClient.connect(MONGODB_SERVER, {
    //   useUnifiedTopology: true,
    // })
    const client = await mongodb.MongoClient.connect(mongodbServer)
    db = client.db(dbName)
    console.log(`connected to ${mongodbServer}`)

    console.log(`dropping database ${mongodbServer}`)
    await db.dropDatabase()

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

    // ignored contacts
    // ignoredContacts.forEach((c) => console.log('ignored: ' + c))
    possibleContacts.forEach((c) => console.log(`'${c}',`))

    console.log('processing stats')
    processContacts()
    processEmailSent()
    processWordCloud()

    console.log('creating indexes')
    await db.collection(emailCollection).createIndex({ '$**': 'text' })

    console.log(`${numEmails} emails processed`)
    // client.close();
  } catch (error) {
    console.error(error)
  }
})()
