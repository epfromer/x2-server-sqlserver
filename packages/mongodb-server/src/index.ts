import { dbName, mongodbServer } from '@klonzo/common'
import * as morgan from 'morgan'
import * as bodyParser from 'body-parser'
import * as express from 'express'
import * as mongodb from 'mongodb'
import { getAllEmail } from './getAllEmail'
import { getContacts } from './getContacts'
import { getEmailList } from './getEmailList'
import { getEmailSent } from './getEmailSent'
import { getSpecificEmail } from './getSpecificEmail'
import { getWordCloud } from './getWordCloud'
import { setContact } from './setContactColor'

export let db: mongodb.Db
;(async (): Promise<void> => {
  try {
    console.log(`connecting to ${mongodbServer}`)
    const client = await mongodb.MongoClient.connect(mongodbServer, {
      useUnifiedTopology: true,
    })
    db = client.db(dbName)
    console.log(`connected to ${mongodbServer}`)

    const app: express.Application = express.default()
    app.use(morgan.default('dev'))

    app.use(bodyParser.json())
    app.use(bodyParser.urlencoded({ extended: true }))
    app.use(bodyParser.text())
    app.use(bodyParser.json({ type: 'application/json' }))

    app.all('/*', (req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*')
      res.header('Access-Control-Allow-Methods', 'POST, DELETE, PUT, GET')
      res.header('Access-Control-Allow-Headers', 'X-Requested-With')
      res.header('Access-Control-Allow-Headers', 'Content-Type')
      next()
    })

    // set up routes
    app.route('/').get(getAllEmail)
    app.route('/email').get(getAllEmail)
    app.route('/email/:id').get(getSpecificEmail)
    app.route('/emaillist').get(getEmailList)
    app.route('/emailsent').get(getEmailSent)
    app.route('/wordcloud').get(getWordCloud)
    app.route('/contacts').get(getContacts)
    app.route('/contacts/:id').put(setContact)

    const port = process.env.PORT || 3000
    app.listen(port)
    console.log(`running on PORT: ${port}`)

    // emit event for integraton tests to start
    // app.emit('appStarted')
  } catch (error) {
    console.error(error)
  }
})()
