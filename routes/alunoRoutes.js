const express = require('express');
const router = express.Router({ mergeParams: true }); // Importante para pegar params da rota pai
const db = require('../config/db');

// Rota para /turmas/:nomeTurma/aluno/:cod
router.get('/:cod', (req, res) => {
  const { cod, nomeTurma } = req.params;

  const sql = `
    SELECT aluno.*, turma.nome AS nome_turma
    FROM aluno
    LEFT JOIN turma ON turma.cod = aluno.turma
    WHERE aluno.cod = ? AND turma.nome = ?`;

  db.query(sql, [cod, nomeTurma], (err, resultados) => {
    if (err || resultados.length === 0) {
      return res.send("Erro ao carregar aluno ou aluno não encontrado na turma.");
    }
    res.render('aluno/aluno', { aluno: resultados[0], erro: null });
  });
});

module.exports = router;
