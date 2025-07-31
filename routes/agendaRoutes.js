const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Página inicial do responsável
router.get('/', (req, res) => {
  const user = req.session.usuario;

  res.render('agenda/index', {
    userImage: user?.foto || null,
    userName: user?.nome || null,
    selectedDate: null
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
