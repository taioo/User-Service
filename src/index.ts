import 'reflect-metadata'
import { createConnection } from 'typeorm'
import * as express from 'express'
import { ApolloServer } from 'apollo-server-express'
import { resolvers } from './resolvers/resolvers'
import { userResolvers } from './resolvers/user.resolvers'
import { roleResolvers } from './resolvers/role.resolvers'
import * as fs from 'fs'
import * as path from 'path'

const typeDefs = readGqlFile('typeDefs/user.gql')
const userDefs = readGqlFile('typeDefs/typeDefs.gql')
const roleDefs = readGqlFile('typeDefs/role.gql')

const startServer = async () => {
  const server = new ApolloServer({
    typeDefs: [typeDefs, userDefs, roleDefs],
    resolvers: [resolvers, userResolvers, roleResolvers]
  })

  await createConnection()

  const app = express()

  server.applyMiddleware({ app })

  app.listen({ port: process.env.PORT }, () =>
    console.log(`🚀 Server ready at http://localhost:${process.env.PORT}${server.graphqlPath}`)
  )
}

startServer()

function readGqlFile (pathFile:string) {
  const query = fs.readFileSync(path.join(__dirname, pathFile), 'utf8').toString()
  return query
}
