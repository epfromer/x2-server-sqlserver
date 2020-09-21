import { graphqlSchema } from '@klonzo/common'
import cors from 'cors'
import * as dotenv from 'dotenv'
import express from 'express'
import { graphqlHTTP } from 'express-graphql'
import * as morgan from 'morgan'
import root from './root'

dotenv.config()

/*
  TODO
  - tools to create schema (codegen)
  - vscode tools
  - leverage tools built into dbs: MongoDB 
    - https://docs.mongodb.com/realm/graphql/
    - https://www.compose.com/articles/using-graphql-with-mongodb/
*/

const app = express()
app.use(morgan.default('dev'))
app.use(cors())
app.use(
  '/graphql',
  graphqlHTTP({
    schema: graphqlSchema,
    rootValue: root,
    graphiql: true,
    customFormatErrorFn: (error) => ({
      message: error.message,
      locations: error.locations,
      stack: error.stack ? error.stack.split('\n') : [],
      path: error.path,
    }),
  })
)

const port = process.env.PORT || 3000
app.listen(port, () => console.log(`running on PORT: ${port}`))
