import cors from 'cors'
import * as dotenv from 'dotenv'
import express, { Application } from 'express'
import { graphqlHTTP } from 'express-graphql'
import { graphqlSchema } from './common'
import root from './root'
dotenv.config()

if (
  !process.env.SQL_HOST ||
  !process.env.SQL_USER ||
  !process.env.SQL_PASSWORD
) {
  throw 'SQL_HOST or SQL_USER or SQL_PASSWORD undefined'
}

const app = express()
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
  }) as Application
)

const port = process.env.PORT || 3000
app.listen(port, () => console.log(`sqlserver running on PORT: ${port}`))
