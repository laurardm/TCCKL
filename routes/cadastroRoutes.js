const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Página de cadastro
router.get('/cadastro', (req, res) => {
  res.render('cadastro', { erro: null, sucesso: null });
});

// Cadastro func
router.post('/cadastro', (req, res) => {
  const { nome, email, telefone, senha } = req.body;

  const query = `INSERT INTO funcionario (cod, nome, data_nasc, email, telefone, foto, matricula, senha, cargo, genero, turma) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  db.query(query, [cod, nome, data_nasc, email, telefone, foto, matricula, senha, cargo, genero, turma], (err) => {
    if (err) {
      console.log(err);
      return res.render('cadastro', { erro: 'Erro ao cadastrar.', sucesso: null });
    }

    res.render('cadastro', { erro: null, sucesso: 'Cadastro realizado com sucesso! Faça login.' });
  });
});

// Cadastro resp
router.post('/cadastro', (req, res) => {
  const { cod, nome, data_nasc, email, foto, senha, genero, parentesco } = req.body;

  const query = `INSERT INTO funcionario (cod, nome, data_nasc, email, foto, senha, genero, parentesco) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?)`;

  db.query(query, [cod, nome, data_nasc, email, foto, senha, genero, parentesco], (err) => {
    if (err) {
      console.log(err);
      return res.render('cadastro', { erro: 'Erro ao cadastrar.', sucesso: null });
    }

    res.render('cadastro', { erro: null, sucesso: 'Cadastro realizado com sucesso! Faça login.' });
  });
});