import cors from 'cors'
import * as dotenv from 'dotenv'
import express, { Application } from 'express'
import { graphqlHTTP } from 'express-graphql'
import { graphqlSchema } from './common'
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
app.get('/', function (req, res) {
  res.send(
    'x2-server-sqlserver: GraphQL interface on email in SQL Server for X2 client'
  )
})

const port = process.env.PORT || 3000
app.listen(port, () => console.log(`sqlserver running on PORT: ${port}`))
