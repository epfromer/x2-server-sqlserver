import {
  dbName,
  emailCollection,
  mongodbServer,
  pstFolder,
} from '@klonzo/common'
import * as fs from 'fs'
import * as mongodb from 'mongodb'
import { msString } from './msString'
import { processContacts } from '../../common/src/processContacts'
import { possibleContacts } from '../../common/src/processEmail'
import { processEmailList } from './processEmailList'
import { processEmailSent } from '../../common/src/processEmailSent'
import { processWordCloud } from '../../common/src/wordCloud'
import { walkPST } from './walkPST'

export let db: mongodb.Db
;(async (): Promise<void> => {
  let numEmails = 0
  try {
    console.log(`connecting to ${mongodbServer}`)
    const client = await mongodb.MongoClient.connect(mongodbServer, {
      useUnifiedTopology: false,
    })
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
