const express = require("express");
const { ApolloServer, gql } = require("apollo-server-express");
const functions = require("firebase-functions");
const admin = require("firebase-admin");

// Initialize your secrets file based on secrets.template.js
const secrets = require("./secrets");

const serviceAccount = secrets.SERVICE_ACCOUNT;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: secrets.DATABASE_URL,
});

const typeDefs = gql`
  type Produto {
    id: Int
    nomeproduto: String
    descricao: String
    fornecedor: String
    preco: Float
    datacadastro: String
  }
  type Query {
    produto: [Produto]
  }
  type Mutation {
    novoProduto(
      id: Int
      nomeproduto: String
      descricao: String
      fornecedor: String
      preco: Float
      datacadastro: String
    ): [Produto]
  }
`;
const resolvers = {
  Query: {
    produto: () => {
      return admin
        .database()
        .ref("produtos")
        .once("value")
        .then((snap) => snap.val())
        .then((val) => Object.keys(val).map((key) => val[key]));
    },
  },
  Mutation: {
    novoProduto(
      _,
      { id, nomeproduto, descricao, fornecedor, preco, datacadastro }
    ) {
      const novo = {
        id: id,
        nomeproduto: nomeproduto,
        descricao: descricao,
        fornecedor: fornecedor,
        preco: preco,
        datacadastro: datacadastro,
      };
      admin.database().ref("produtos").push(novo);

      return admin
        .database()
        .ref("produtos")
        .limitToLast(1)
        .once("value")
        .then((snap) => snap.val())
        .then((val) => Object.keys(val).map((key) => val[key]));
    },
  },
};

const app = express();

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server.applyMiddleware({ app, path: "/", cors: true });

exports.graphql = functions.https.onRequest(app);
