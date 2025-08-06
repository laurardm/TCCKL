const express = require('express');
const router = express.Router();
const db = require('../config/db'); // seu módulo de conexão

// Renderiza o formulário "Esqueci a senha"
router.get('/', (req, res) => {
  res.render('esqueci-senha/esquecisenha', { erro: null, sucesso: null });
});

// Processa o formulário
router.post('/esqueci-senha', (req, res) => {
  const email = req.body.email;

  const sql = 'SELECT senha FROM usuario WHERE login = ? LIMIT 1';

  db.query(sql, [email], (err, results) => {
    if (err) {
      console.error('Erro ao consultar senha:', err);
      return res.status(500).send('Erro ao tentar recuperar a senha.');
    }

    if (results.length === 0) {
      return res.send('E-mail não encontrado.<br><a href="/esqueci-senha">Tente novamente</a>');
    }

    // Mostra a senha direto (apenas para testes)
    const senha = results[0].senha;
    res.send(`Sua senha é: <strong>${senha}</strong><br><a href="/">Voltar para o login</a>`);
  });
});

module.exports = router;
