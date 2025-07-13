const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Rota dinâmica: /turmas/B1, /turmas/M1A etc
router.get('/:nomeTurma', (req, res) => {
  const nomeTurma = req.params.nomeTurma;

  const query = `
    SELECT aluno.nome
    FROM aluno
    JOIN turma ON aluno.turma = turma.cod
    WHERE turma.nome = ?
  `;

  db.query(query, [nomeTurma], (err, results) => {
    if (err) {
      console.error('Erro ao buscar alunos:', err);
      return res.status(500).send('Erro no servidor');
    }

    res.render('turma/index', {
      nomeTurma,
      alunos: results,
      usuario: req.session.usuario // precisa ter tipo: 'funcionario' ou 'responsavel'
    });
  });
});

module.exports = router;
