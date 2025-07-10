const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Página de cadastro
router.get('/', (req, res) => {
  res.render('cadastro/cadastro', { erro: null, sucesso: null });
});

// Rota POST para cadastrar responsável (sem verificação de e-mail duplicado)
router.post('/resp', (req, res) => {
  const { nome, email, senha, data_nasc, genero } = req.body;

  if (!nome || !email || !senha || !data_nasc || !genero) {
    return res.status(400).send('Todos os campos são obrigatórios.');
  }

  const inserirSql = `
    INSERT INTO responsaveis (nome, email, senha, data_nasc, genero)
    VALUES (?, ?, ?, ?, ?)`;

  db.query(inserirSql, [nome, email, senha, data_nasc, genero], (err, result) => {
    if (err) {
      console.error('Erro no banco ao inserir:', err);
      return res.status(500).send('Erro ao cadastrar: ' + err.message);
    }
    res.status(200).send('Cadastro realizado com sucesso');
  });
});

module.exports = router;
