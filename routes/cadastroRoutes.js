const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Página de cadastro
router.get('/', (req, res) => {
  res.render('cadastro/cadastro', { erro: null, sucesso: null });
});

// Cadastro de funcionário
router.post('/func', (req, res) => {
  const { cod, nome, data_nasc, email, telefone, foto, matricula, senha, cargo, genero, turma } = req.body;

  const query = `
    INSERT INTO funcionario 
    (cod, nome, data_nasc, email, telefone, foto, matricula, senha, cargo, genero, turma) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  db.query(query, [cod, nome, data_nasc, email, telefone, foto, matricula, senha, cargo, genero, turma], (err) => {
    if (err) {
      console.log(err);
      return res.render('cadastro', { erro: 'Erro ao cadastrar funcionário.', sucesso: null });
    }

    res.render('cadastro', { erro: null, sucesso: 'Funcionário cadastrado com sucesso!' });
  });
});

// Cadastro de responsável
router.post('/resp', (req, res) => {
  const { cod, nome, data_nasc, email, foto, senha, genero, parentesco } = req.body;

  const query = `
    INSERT INTO responsavel 
    (cod, nome, data_nasc, email, foto, senha, genero, parentesco) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

  db.query(query, [cod, nome, data_nasc, email, foto, senha, genero, parentesco], (err) => {
    if (err) {
      console.log(err);
      return res.render('cadastro', { erro: 'Erro ao cadastrar responsável.', sucesso: null });
    }

    res.render('cadastro', { erro: null, sucesso: 'Responsável cadastrado com sucesso!' });
  });
});

module.exports = router; // ✅ ISSO É ESSENCIAL!
