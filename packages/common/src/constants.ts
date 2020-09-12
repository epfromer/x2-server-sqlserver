// Common vars
export const fsFolder = 'c:/github/outlook/'
export const dbName = 'x2'
export const defaultLimit = 50
export const onlyHot = true
export const emailCollection = 'email'
export const custodianCollection = 'custodians'
export const emailSentByDayCollection = 'emailsentbyday'
export const wordCloudCollection = 'wordcloud'

// TODO .env files for server addresses, document mongo setting of pwd,
// TODO put that into heroku interface, not .env

// MongoDB (via MongoDB.net or Docker)
export const mongodbServer =
  'mongodb+srv://test:f00bar@cluster0-vaftj.mongodb.net/x2?retryWrites=true&w=majority'
// https://hub.docker.com/_/mongo
export const mongodbServer1 = 'mongodb://localhost:27017/x2'

// ElasticSearch (via Docker)
// https://www.elastic.co/guide/en/elasticsearch/reference/current/docker.html
export const elasticServer = 'http://localhost:9200'
