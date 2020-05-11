/* eslint-disable @typescript-eslint/no-explicit-any */
import * as config from 'config'
import * as fs from 'fs'
import * as mongodb from 'mongodb'
import { msString } from './msString'
import { ignoredContacts, possibleContacts } from './processEmail'
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
    log = require('simple-node-logger').createSimpleLogger('output.log')

    // connect to db
    log.info(`connecting to ${config.get('dbHost')}`)
    const client = await mongodb.MongoClient.connect(config.get('dbHost'), {
      useUnifiedTopology: true,
    })
    db = client.db(config.get('dbName'))
    log.info(`connected to ${config.get('dbHost')}`)

    // drop database if requested
    if (config.get('dropDatabase')) {
      log.info(`dropping database ${config.get('dbHost')}`)
      await db.dropDatabase()
    }

    // walk folder
    const pstFolder: string = config.get('pstFolder')
    log.info(`walking folder ${pstFolder}`)
    const folderListing = fs.readdirSync(pstFolder)
    for (const file of folderListing) {
      log.info(`processing ${file}\n`)
      const processStart = Date.now()
      const emails = walkPST(pstFolder + file)
      log.info(
        file +
          ': processing complete, ' +
          msString(emails.length, processStart, Date.now())
      )
      if (emails.length > 0) {
        // insert into db
        const dbInsertStart = Date.now()
        log.info(`inserting ${emails.length} documents`)
        processEmailList(emails)
        log.info(
          file +
            ': insertion complete, ' +
            msString(emails.length, dbInsertStart, Date.now())
        )
        numEmails += emails.length
      } else {
        log.info(file + ': processing complete, no emails')
      }
    }

    // ignored contacts
    ignoredContacts.forEach((c) => log.warn('ignored: ' + c))
    possibleContacts.forEach((c) => log.warn('possible: ' + c))

    // process stats
    log.info('processing stats')
    processStatsContacts()
    processStatsEmailSentMap()
    processStatsWordCloudMap()

    // create indexes
    log.info('creating indexes')
    await db
      .collection(config.get('dbEmailCollection'))
      .createIndex({ '$**': 'text' })

    log.info(`${numEmails} emails processed`)
    // client.close();
  } catch (error) {
    console.error(error)
  }
})()
