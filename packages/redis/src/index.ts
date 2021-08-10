import { graphqlSchema } from '@klonzo/common'
import cors from 'cors'
import * as dotenv from 'dotenv'
import express, { Application } from 'express'
import { graphqlHTTP } from 'express-graphql'
import root from './root'
dotenv.config()

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
app.listen(port, () => console.log(`redis running on PORT: ${port}`))
