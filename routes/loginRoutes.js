const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', (req, res) => {
  res.render('login/login', { erro: null });
});

router.post('/', (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.render('login/login', { erro: 'Preencha email e senha.' });
  }

  // Tenta como responsável (email)
  db.query('SELECT * FROM responsaveis WHERE email = ?', [email], (err, resultsResp) => {
    if (err) {
      console.error('Erro no banco responsaveis:', err);
      return res.render('login/login', { erro: 'Erro no servidor.' });
    }

    //verifica se há mais de uma senha pro mesmo usuário e libera a utilização das mesmas
    if (resultsResp.length > 0) {
    const usuarioValido = resultsResp.find(user => user.senha === senha);

    if (!usuarioValido) {
      return res.render('login/login', { erro: 'Senha incorreta.' });
    }

    req.session.usuario = usuarioValido;
    return res.redirect('/resp');
  }


    // Tenta como funcionário (matrícula)
    db.query('SELECT * FROM funcionario WHERE matricula = ?', [email], (err, resultsFunc) => {
      if (err) {
        console.error('Erro no banco funcionario:', err);
        return res.render('login/login', { erro: 'Erro no servidor.' });
      }

      if (resultsFunc.length === 0) {
        return res.render('login/login', { erro: 'E-mail ou matrícula não cadastrados.' });
      }

      const user = resultsFunc[0];
      if (user.senha !== senha) {
        return res.render('login/login', { erro: 'Senha incorreta.' });
      }

      req.session.usuario = user;
      return res.redirect('/func');
    });
  });
});

module.exports = router;
