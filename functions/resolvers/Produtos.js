const admin = require("firebase-admin");

module.exports = {
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
