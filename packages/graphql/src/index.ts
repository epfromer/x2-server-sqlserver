import cors from 'cors'
import * as dotenv from 'dotenv'
import express from 'express'
import { graphqlHTTP } from 'express-graphql'
import root from './root'
import schema from './schema'

dotenv.config()

/*
  TODO
  - get all initial data (wordcloud, emailsentbyday, custodians, etc) in one call
  - tools to create schema (codegen)
  - vscode tools
  - leverage tools built into dbs: MongoDB 
    - https://docs.mongodb.com/realm/graphql/
    - https://www.compose.com/articles/using-graphql-with-mongodb/
*/

const app = express()
app.use(cors())
app.use(
  '/graphql',
  graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
  })
)

const port = process.env.PORT || 3000
app.listen(port, () => console.log(`running on PORT: ${port}`))
