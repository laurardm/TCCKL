const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET agenda e carregar recados e eventos do aluno
router.get('/', (req, res) => {
  const alunoCod = req.query.aluno;
  const selectedDate = req.query.data;

  if (!alunoCod) {
    return res.render('agenda/index', {
      nomeAluno: 'não definido',
      userImage: null,
      userName: null,
      selectedDate,
      agenda_id: null,
      recadosEventos: []
    });
  }

  const sqlAluno = 'SELECT nome, agenda FROM aluno WHERE cod = ?';

  db.query(sqlAluno, [alunoCod], (err, results) => {
    if (err || results.length === 0) {
      return res.render('agenda/index', {
        nomeAluno: 'não definido',
        userImage: null,
        userName: null,
        selectedDate,
        agenda_id: null,
        recadosEventos: []
      });
    }

    const nomeAluno = results[0].nome;
    const agenda_id = results[0].agenda; // pega a agenda do aluno

    if (!agenda_id) {
      return res.render('agenda/index', {
        nomeAluno,
        userImage: null,
        userName: null,
        selectedDate,
        agenda_id: null,
        recadosEventos: []
      });
    }

    const sqlRecados = 'SELECT descricao, datar AS data, "Recado" AS tipo FROM recados WHERE agenda_id = ?';
    const sqlEventos = 'SELECT descricao, datae AS data, "Evento" AS tipo FROM eventos WHERE agenda_id = ?';

    db.query(sqlRecados, [agenda_id], (errRec, recados) => {
      if (errRec) recados = [];
      db.query(sqlEventos, [agenda_id], (errEvt, eventos) => {
        if (errEvt) eventos = [];

        const todos = [...recados, ...eventos];

        const grouped = {};
        todos.forEach(item => {
          if (!grouped[item.data]) grouped[item.data] = [];
          grouped[item.data].push(`${item.tipo}: ${item.descricao}`);
        });

        const recadosEventos = Object.keys(grouped)
          .sort()
          .map(data => ({ date: data, contents: grouped[data] }));

        res.render('agenda/index', {
          nomeAluno,
          userImage: null,
          userName: null,
          selectedDate,
          agenda_id, // passa corretamente
          recadosEventos
        });
      });
    });
  });
});

// POST - adicionar recado
router.post('/adicionar-recado', (req, res) => {
  const { descricao, data, agenda_id } = req.body;
  if (!descricao || !data || !agenda_id) {
    return res.status(400).json({ erro: 'Descrição, data e agenda são obrigatórios' });
  }

  const sql = 'INSERT INTO recados (descricao, datar, agenda_id) VALUES (?, ?, ?)';
  db.query(sql, [descricao, data, agenda_id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ erro: 'Erro ao inserir recado' });
    }
    res.json({ sucesso: true, id: result.insertId });
  });
});

// POST - adicionar evento
router.post('/adicionar-evento', (req, res) => {
  const { descricao, data, agenda_id } = req.body;
  if (!descricao || !data || !agenda_id) {
    return res.status(400).json({ erro: 'Descrição, data e agenda são obrigatórios' });
  }

  const sql = 'INSERT INTO eventos (descricao, datae, agenda_id) VALUES (?, ?, ?)';
  db.query(sql, [descricao, data, agenda_id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ erro: 'Erro ao inserir evento' });
    }
    res.json({ sucesso: true, id: result.insertId });
  });
});

module.exports = router;
