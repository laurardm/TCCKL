const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Buscar alunos por nome da turma
router.get('/:nomeTurma', (req, res) => {
  const nomeTurma = req.params.nomeTurma;

  db.query('SELECT cod FROM turma WHERE nome = ?', [nomeTurma], (err, turmaRes) => {
    if (err || turmaRes.length === 0) return res.status(400).send("Turma não encontrada.");

    const turmaId = turmaRes[0].cod;
    db.query('SELECT cod, nome, data_nasc, foto FROM aluno WHERE turma = ?', [turmaId], (err2, alunos) => {
      if (err2) return res.status(500).send("Erro ao buscar alunos.");
      res.json(alunos);
    });
  });
});

// Adicionar novo aluno
router.post('/', (req, res) => {
  const { nome, data_nasc, turma_id, genero_id, agenda_id, foto } = req.body;
  const sql = 'INSERT INTO aluno (nome, data_nasc, turma, genero, agenda, foto) VALUES (?, ?, ?, ?, ?, ?)';
  db.query(sql, [nome, data_nasc, turma_id, genero_id, agenda_id, foto || "/imagens/perfil.png"], (err, result) => {
    if (err) return res.status(500).send("Erro ao adicionar aluno.");
    res.json({ id: result.insertId });
  });
});

// Editar nome e foto
router.put('/:id', (req, res) => {
  const { nome, foto } = req.body;
  db.query('UPDATE aluno SET nome = ?, foto = ? WHERE cod = ?', [nome, foto, req.params.id], (err) => {
    if (err) return res.status(500).send("Erro ao editar aluno.");
    res.sendStatus(200);
  });
});

// Excluir aluno
router.delete('/:id', (req, res) => {
  db.query('DELETE FROM aluno WHERE cod = ?', [req.params.id], (err) => {
    if (err) return res.status(500).send("Erro ao excluir aluno.");
    res.sendStatus(200);
  });
});

module.exports = router;
