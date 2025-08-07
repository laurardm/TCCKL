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
    const agenda_id = results[0].agenda;

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

    const sqlRecados = `
      SELECT cod, descricao, DATE_FORMAT(datar, "%Y-%m-%d") AS data, "Recado" AS tipo 
      FROM recados 
      WHERE agenda_id = ?`;
    const sqlEventos = `
      SELECT cod, descricao, DATE_FORMAT(datae, "%Y-%m-%d") AS data, "Evento" AS tipo 
      FROM eventos 
      WHERE agenda_id = ?`;

    db.query(sqlRecados, [agenda_id], (errRec, recados) => {
      if (errRec) recados = [];
      db.query(sqlEventos, [agenda_id], (errEvt, eventos) => {
        if (errEvt) eventos = [];

        const todos = [...recados, ...eventos];
        const grouped = {};

        todos.forEach(item => {
          if (!grouped[item.data]) grouped[item.data] = [];
          grouped[item.data].push({
            tipo: item.tipo,
            descricao: item.descricao,
            cod: item.cod
          });
        });

        const recadosEventos = Object.keys(grouped)
          .sort()
          .map(data => ({ date: data, contents: grouped[data] }));

        res.render('agenda/index', {
          nomeAluno,
          userImage: null,
          userName: null,
          selectedDate,
          agenda_id,
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

// EDITAR recado
router.put('/recados/:cod', (req, res) => {
  const { cod } = req.params;
  const { descricao } = req.body;

  const sql = 'UPDATE recados SET descricao = ? WHERE cod = ?';
  db.query(sql, [descricao, cod], (err, result) => {
    if (err) {
      console.error('Erro ao editar recado:', err);
      return res.status(500).json({ error: 'Erro ao editar recado' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Recado não encontrado' });
    }
    res.status(200).json({ message: 'Recado atualizado com sucesso!' });
  });
});

// EDITAR evento
router.put('/eventos/:cod', (req, res) => {
  const { cod } = req.params;
  const { descricao } = req.body;

  const sql = 'UPDATE eventos SET descricao = ? WHERE cod = ?';
  db.query(sql, [descricao, cod], (err, result) => {
    if (err) {
      console.error('Erro ao editar evento:', err);
      return res.status(500).json({ error: 'Erro ao editar evento' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Evento não encontrado' });
    }
    res.status(200).json({ message: 'Evento atualizado com sucesso!' });
  });
});

module.exports = router;
