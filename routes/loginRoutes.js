const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', (req, res) => {
  res.render('login/login', { erro: null });
});

router.post('/', (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.render('login/login', { erro: 'Preencha email/matrícula e senha.' });
  }

  const isEmail = email.includes('@');

  if (isEmail) {
    // Login como responsável
    db.query('SELECT * FROM responsaveis WHERE email = ?', [email], (err, resultsResp) => {
      if (err) {
        console.error('Erro no banco responsaveis:', err);
        return res.render('login/login', { erro: 'Erro no servidor.' });
      }

      const usuarioValido = resultsResp.find(user => user.senha === senha);

      if (!usuarioValido) {
        return res.render('login/login', { erro: 'Senha incorreta ou usuário não encontrado.' });
      }

      req.session.usuario = usuarioValido;
      return res.redirect('/resp');
    });

  } else {
    // Login como funcionário (matrícula)
    db.query('SELECT * FROM funcionario WHERE matricula = ?', [email], (err, resultsFunc) => {
      if (err) {
        console.error('Erro no banco funcionario:', err);
        return res.render('login/login', { erro: 'Erro no servidor.' });
      }

      if (resultsFunc.length === 0) {
        return res.render('login/login', { erro: 'Matrícula não cadastrada.' });
      }

      const user = resultsFunc[0];
      if (user.senha !== senha) {
        return res.render('login/login', { erro: 'Senha incorreta.' });
      }

      req.session.usuario = user;
      return res.redirect('/func');
    });
  }
});

module.exports = router;