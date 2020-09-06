import {
  custodianCollection,
  dbName,
  emailCollection,
  emailSentByDayCollection,
  mongodbServer,
  wordCloudCollection,
} from '@klonzo/common'
import * as bodyParser from 'body-parser'
import * as express from 'express'
import * as mongodb from 'mongodb'
import * as morgan from 'morgan'
import { getAllEmail } from './getAllEmail'
import { getCustodians } from './getCustodians'
import { getEmailSentByDay } from './getEmailSent'
import { getSpecificEmail } from './getSpecificEmail'
import { getWordCloud } from './getWordCloud'
import { setCustodian } from './setCustodian'

export let db: mongodb.Db

async function run() {
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
  app.route('/emailsentbyday').get(getEmailSentByDay)
  app.route('/wordcloud').get(getWordCloud)
  app.route('/custodians').get(getCustodians)
  app.route('/custodians/:id').put(setCustodian)

  const port = process.env.PORT || 3000
  app.listen(port)
  console.log(`running on PORT: ${port}`)
}

run().catch(console.error)
