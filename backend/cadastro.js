const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Página de cadastro
router.get('/', (req, res) => {
  res.render('cadastro/cadastro', { erro: null, sucesso: null });
});

// Cadastro de responsável (armazenando a senha só na tabela 'usuario')
router.post('/resp', (req, res) => {
  const { nome, email, senha, data_nasc, genero } = req.body;

  if (!nome || !email || !senha || !data_nasc || !genero) {
    return res.status(400).send('Todos os campos são obrigatórios.');
  }

  const inserirResponsavel = `
    INSERT INTO responsaveis (nome, email, data_nasc, genero)
    VALUES (?, ?, ?, ?)`;

  db.query(
    inserirResponsavel,
    [nome, email, data_nasc, genero],
    (err, result) => {
      if (err) {
        console.error('Erro ao inserir responsável:', err);
        return res.status(500).send('Erro ao cadastrar responsável.');
      }

      const codResponsavel = result.insertId;

      const inserirUsuario = `
        INSERT INTO usuario (login, senha, tipo, cod_responsavel)
        VALUES (?, ?, 'responsavel', ?)`;

      db.query(
        inserirUsuario,
        [email, senha, codResponsavel],
        (err2, result2) => {
          if (err2) {
            console.error('Erro ao inserir usuário:', err2);
            return res.status(500).send('Erro ao criar usuário.');
          }

          // Sucesso
          res.status(200).send('Cadastro realizado com sucesso');
        }
      );
    }
  );
});

module.exports = router;
