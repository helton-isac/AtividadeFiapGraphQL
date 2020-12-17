const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const functions = require("firebase-functions");
const admin = require("firebase-admin");

// Initialize your secrets file based on secrets.template.js
const secrets = require("./secrets");

const resolvers = require("./resolvers");
const { importSchema } = require("graphql-import");

const serviceAccount = secrets.SERVICE_ACCOUNT;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: secrets.DATABASE_URL,
});

const app = express();

const server = new ApolloServer({
  typeDefs: importSchema("./schema/index.graphql"),
  resolvers: resolvers,
});

server.applyMiddleware({ app, path: "/", cors: true });

exports.graphql = functions.https.onRequest(app);
