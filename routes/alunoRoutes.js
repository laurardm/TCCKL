const express = require('express');
const router = express.Router({ mergeParams: true });
const db = require('../config/db');

// GET aluno pelo código e nome da turma
router.get('/:cod', (req, res) => {
  const { cod, nomeTurma } = req.params;
  const sql = `
    SELECT aluno.*, turma.nome AS nome_turma
    FROM aluno LEFT JOIN turma ON turma.cod = aluno.turma
    WHERE aluno.cod = ? AND turma.nome = ?`;

  db.query(sql, [cod, nomeTurma], (err, resultados) => {
    if (err || resultados.length === 0) {
      return res.send("Erro ao carregar aluno ou aluno não encontrado na turma.");
    }
    res.render('aluno/aluno', { aluno: resultados[0], erro: null });
  });
});

// POST para atualizar aluno (nome + foto em base64)
router.post('/:cod', (req, res) => {
  const { cod, nomeTurma } = req.params;
  const { nome, foto } = req.body;

  // Atualiza nome e foto no banco
  const sql = `UPDATE aluno SET nome = ?, foto = ? WHERE cod = ?`;

  db.query(sql, [nome, foto || null, cod], (err) => {
    if (err) {
      console.error("Erro ao atualizar aluno:", err);
      return res.status(500).send("Erro ao atualizar aluno.");
    }
    res.status(200).send("Aluno atualizado com sucesso.");
  });
});

module.exports = router;