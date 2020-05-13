/* eslint-disable @typescript-eslint/no-explicit-any */
import * as config from 'config'
import * as fs from 'fs'
import * as mongodb from 'mongodb'
import { msString } from './msString'
import { possibleContacts } from './processEmail'
import { processEmailList } from './processEmailList'
import { processStatsContacts } from './statsContacts'
import { processStatsEmailSentMap } from './statsEmailSent'
import { processStatsWordCloudMap } from './statsWordCloud'
import { walkPST } from './walkPST'

export let db: any
export let log: any

export interface EmailDoc {
  id: string
  sent: Date
  from: string
  fromContact?: string
  to: string
  toContact?: string
  cc: string
  bcc: string
  subject: string
  body: string
}

// Main async app that walks list of PSTs and processes them.
;(async (): Promise<any> => {
  let numEmails = 0

  try {
    // connect to db
    console.log(`connecting to ${config.get('dbHost')}`)
    // const client = await mongodb.MongoClient.connect(config.get('dbHost'), {
    //   useUnifiedTopology: true,
    // })
    const client = await mongodb.MongoClient.connect(config.get('dbHost'))
    db = client.db(config.get('dbName'))
    console.log(`connected to ${config.get('dbHost')}`)

    // drop database if requested
    if (config.get('dropDatabase')) {
      console.log(`dropping database ${config.get('dbHost')}`)
      await db.dropDatabase()
    }

    // walk folder
    const pstFolder: string = config.get('pstFolder')
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

    // process stats
    console.log('processing stats')
    processStatsContacts()
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
