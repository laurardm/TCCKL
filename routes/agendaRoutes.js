const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', (req, res) => {
  const alunoCod = req.query.aluno;
  const selectedDate = req.query.data; // ← pega a data da URL (ex: ?data=2025-08-01)

  if (!alunoCod) {
    return res.render('agenda/index', {
      nomeAluno: 'não definido',
      userImage: null,
      userName: null,
      selectedDate // ← adiciona aqui também
    });
  }

  const sql = 'SELECT nome FROM aluno WHERE cod = ?';

  db.query(sql, [alunoCod], (err, results) => {
    if (err || results.length === 0) {
      return res.render('agenda/index', {
        nomeAluno: 'não definido',
        userImage: null,
        userName: null,
        selectedDate
      });
    }

    const nomeAluno = results[0].nome;

    res.render('agenda/index', {
      nomeAluno,
      userImage: null,
      userName: null,
      selectedDate // ← envia para a view
    });
  });
});


// Adicionar recado
router.post('/adicionar-recado', (req, res) => {
  const { descricao, data } = req.body;
  if (!descricao || !data) {
    return res.status(400).json({ erro: 'Descrição e data são obrigatórias' });
  }

  const sql = 'INSERT INTO recados (descricao, datar) VALUES (?, ?)';
  db.query(sql, [descricao, data], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ erro: 'Erro ao inserir recado' });
    }
    res.json({ sucesso: true, id: result.insertId });
  });
});

// Adicionar evento
router.post('/adicionar-evento', (req, res) => {
  const { descricao, data } = req.body;
  if (!descricao || !data) {
    return res.status(400).json({ erro: 'Descrição e data são obrigatórias' });
  }

  const sql = 'INSERT INTO eventos (descricao, datae) VALUES (?, ?)';
  db.query(sql, [descricao, data], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ erro: 'Erro ao inserir evento' });
    }
    res.json({ sucesso: true, id: result.insertId });
  });
});

module.exports = router;
