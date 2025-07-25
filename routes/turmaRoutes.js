const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', (req, res) => {
  const sql = 'SELECT nome FROM turma ORDER BY nome';
  db.query(sql, (err, turmas) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Erro ao buscar turmas');
    }
    // Passa a variável com nome 'turmas' para combinar com o ejs
    res.render('turmas/index', { turmas });
  });
});

// GET - Exibir os alunos da turma
router.get('/:nomeTurma', (req, res) => {
  const nomeTurma = req.params.nomeTurma;
  const sqlTurma = 'SELECT cod, nome FROM turma WHERE TRIM(UPPER(nome)) = UPPER(?) LIMIT 1';

  db.query(sqlTurma, [nomeTurma], (err, turmaResults) => {
    if (err || turmaResults.length === 0) {
      return res.render('turmas/turmanome', { nomeTurma, alunos: [] });
    }

    const codTurma = turmaResults[0].cod;

    const sqlAlunos = `
      SELECT a.cod, a.nome, a.agenda, f.linkf AS foto
      FROM aluno a
      LEFT JOIN agenda ag ON a.agenda = ag.cod
      LEFT JOIN fotosa f ON ag.fotosa = f.cod
      WHERE a.turma = ?
    `;

    db.query(sqlAlunos, [codTurma], (err2, alunos) => {
      if (err2) {
        return res.render('turmas/turmanome', { nomeTurma, alunos: [] });
      }

      res.render('turmas/turmanome', {
        nomeTurma: turmaResults[0].nome.trim(),
        alunos
      });
    });
  });
});

// POST - Adicionar aluno
router.post('/:nomeTurma', (req, res) => {
  const { nome, agenda } = req.body;
  const nomeTurma = req.params.nomeTurma;

  const sqlTurma = 'SELECT cod FROM turma WHERE TRIM(UPPER(nome)) = UPPER(?) LIMIT 1';
  db.query(sqlTurma, [nomeTurma], (err, result) => {
    if (err || result.length === 0) return res.status(400).send('Turma não encontrada');

    const codTurma = result[0].cod;
    const sqlInsert = 'INSERT INTO aluno (nome, turma) VALUES (?, ?)';
    db.query(sqlInsert, [nome, codTurma || null], (err2) => {
      if (err2) return res.status(500).send('Erro ao adicionar aluno');
      res.status(200).send('Aluno adicionado com sucesso');
    });
  });
});

// PUT - Editar aluno
router.put('/:nomeTurma', (req, res) => {
  const { cod, nome } = req.body;
  const sqlUpdate = 'UPDATE aluno SET nome = ?WHERE cod = ?';

  db.query(sqlUpdate, [nome, agenda || null, cod], (err) => {
    if (err) return res.status(500).send('Erro ao editar aluno');
    res.status(200).send('Aluno atualizado');
  });
});

// DELETE - Excluir aluno
router.delete('/:nomeTurma', (req, res) => {
  const { cod } = req.body;
  const sqlDelete = 'DELETE FROM aluno WHERE cod = ?';

  db.query(sqlDelete, [cod], (err) => {
    if (err) return res.status(500).send('Erro ao excluir aluno');
    res.status(200).send('Aluno excluído');
  });
});

module.exports = router;
