import express from 'express'
import { graphqlHTTP } from 'express-graphql'
import {
  buildSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLList,
  GraphQLSchema,
} from 'graphql'
import * as dotenv from 'dotenv'
dotenv.config()

// TODO https://docs.mongodb.com/realm/graphql/
// TODO https://www.compose.com/articles/using-graphql-with-mongodb/

const wordCloud = [
  {
    tag: 'avici',
    weight: 32,
  },
  {
    tag: 'azurix',
    weight: 523,
  },
  {
    tag: 'backbone',
    weight: 150,
  },
  {
    tag: 'braveheart',
    weight: 29,
  },
]

/*
const WordCloudType = new GraphQLObjectType({
  name: 'word',
  fields: () => ({
    tag: { type: GraphQLString },
    weight: { type: GraphQLInt },
  }),
})

const queryType = new GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    words: {
      type: new GraphQLList(WordCloudType),
      resolve: () => wordCloud,
    },
  }),
})

const schema = new GraphQLSchema({ query: queryType })
*/

const schema = buildSchema(`
  type Word {
    tag: String
    weight: Int
  }
  type Query {
    words: [Word]
  }
`)

const root = {
  words: () => wordCloud,
}

const app = express()
app.use(
  '/graphql',
  graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
  })
)
app.listen(4000, () => console.log('Now browse to localhost:4000/graphql'))
