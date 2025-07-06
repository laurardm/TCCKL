const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Página de cadastro
router.get('/', (req, res) => {
  res.render('cadastro/cadastro', { erro: null, sucesso: null });
});

// Rota POST para cadastrar responsável
router.post('/resp', (req, res) => {
  const { nome, email, senha, data_nasc, genero } = req.body;

  if (!nome || !email || !senha || !data_nasc || !genero) {
    return res.status(400).send('Todos os campos são obrigatórios.');
  }

  // Verifica se o e-mail já está cadastrado
  const verificarSql = `SELECT * FROM responsaveis WHERE email = ?`;
  db.query(verificarSql, [email], (err, results) => {
    if (err) {
      console.error('Erro ao verificar e-mail:', err);
      return res.status(500).send('Erro no servidor ao verificar e-mail.');
    }

    if (results.length > 0) {
      return res.status(409).send('Este e-mail já está cadastrado.');
    }

    // Insere o novo responsável se o e-mail não existe
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
});

module.exports = router;
