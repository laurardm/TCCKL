const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.post('/', (req, res) => {
  if (!req.session.usuario) {
    return res.redirect('/login');
  }

  const { nome, data_nasc, email, telefone } = req.body;

  const sql = `
    UPDATE funcionario
    SET nome = ?, data_nasc = ?, email = ?, telefone = ?`;

  db.query(sql, [nome, data_nasc, email, telefone], (err, result) => {
    if (err) {
      console.error(err);
      return res.render('perfil/perfil', { 
        erro: 'Erro ao atualizar dados.', 
        nome, dataNascimento: data_nasc, email, telefone, turmas: req.body.turmas 
      });
    }

    // Atualizar dados na sessão
    req.session.usuario.nome = nome;
    req.session.usuario.data_nasc = data_nasc;
    req.session.usuario.email = email;
    req.session.usuario.telefone = telefone;

    res.redirect('/func'); // ou renderizar com mensagem sucesso
  });
});

module.exports = router;