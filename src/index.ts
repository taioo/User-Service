import 'reflect-metadata'
import { createConnection } from 'typeorm'
import { ApolloServer, AuthenticationError } from 'apollo-server-express'
import { mainResolvers } from './resolvers/mainResolvers'
import { userResolvers } from './resolvers/user.resolvers'
import { roleResolvers } from './resolvers/role.resolvers'
import { User } from './entity/User'
import { IncomingMessage } from 'http'

import fs = require('fs')
import path = require('path')
import jwt = require('jsonwebtoken')
import express = require('express')

const SECRET_KEY = process.env.SECRET_KEY || 'my8secret8key'
const mainDefs = readGqlFile('typeDefs/main.gql')
const userDefs = readGqlFile('typeDefs/user.gql')
const roleDefs = readGqlFile('typeDefs/role.gql')
const app = express()

app.post('/get-token', async (req, res) => {
  const { email, password } = req.query
  const user = await User.findOne({ where: { email: email } })
  if (user) {
    const match = password === user.password
    if (match) {
      // create the token for the user with a secret_key and send
      const token = jwt.sign({ email: user.email, id: user.id }, SECRET_KEY)
      res.send({
        success: true,
        token: token
      })
    } else {
      // return message password is incorrect
      res.status(401).send({
        success: false,
        message: 'Incorrect credentials'
      })
    }
  } else {
    // return message user does not exists
    res.status(404).send({
      success: false,
      message: `Could not find account: ${email}`
    })
  }
})
const context = ({ req }: Req) => {
  // get the user token from the headers
  const token = req.headers.authorization || ''
  try {
    jwt.verify(token, SECRET_KEY)
  } catch (e) {
    throw new AuthenticationError(
      'Authentication token is invalid, please log in'
    )
  }
}
const server = new ApolloServer({
  typeDefs: [mainDefs, userDefs, roleDefs],
  resolvers: [mainResolvers, userResolvers, roleResolvers],
  context,
  tracing: true,
  playground: {
    settings: {
      'request.credentials': 'include'
    }
  }
})

const startServer = async () => {
  await createConnection()
  server.applyMiddleware({ app })
  const port = process.env.PORT || 3333
  app.listen({ port: port }, () =>
    console.log(`🚀 running in ${process.env.NODE_ENV} mode \n Server ready at http://localhost:${port}${server.graphqlPath}`)
  )
}

startServer()

type Req = { req: IncomingMessage }

function readGqlFile (pathFile: string) {
  const query = fs.readFileSync(path.join(__dirname, pathFile), 'utf8').toString()
  return query
}
