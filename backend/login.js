const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Página de login
router.get('/', (req, res) => {
  res.render('login/login', { erro: null });
});

// Processar login
router.post('/', (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.render('login/login',{ erro: 'Preencha todos os campos.' });
  }

  const sql = `
    SELECT * FROM usuario
    WHERE login = ? AND senha = ?`;

  db.query(sql, [email, senha], (err, results) => {
    if (err) {
      console.error('Erro ao consultar login:', err);
      return res.render('login/login', { erro: 'Erro no servidor. Tente novamente.' });
    }

    if (results.length === 0) {
      return res.render('login/login', { erro: 'Login ou senha incorretos.' });
    }

    const usuario = results[0];

    // Salvar usuário na sessão
    req.session.usuario = {
      cod: usuario.cod_funcionario || usuario.cod_responsavel || usuario.cod, 
      nome: usuario.login,
      tipo: usuario.tipo
    };

    if (usuario.tipo === 'responsavel') {
      res.redirect('/resp'); 
    } else if (usuario.tipo === 'funcionario') {
      res.redirect('/func');
    } else {
      res.render('login/login', { erro: 'Tipo de usuário inválido.' });
    }
  });
});


module.exports = router;
