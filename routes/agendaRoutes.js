const express = require('express');
const router = express.Router();
const db = require('../config/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Middleware para permitir só funcionários nas rotas que alteram dados
function verificarFuncionario(req, res, next) {
  if (req.session.usuario && req.session.usuario.tipo === "funcionario") {
    next();
  } else {
    res.status(403).send("Acesso negado: apenas funcionários podem realizar esta ação.");
  }
}

// ==== Configuração do multer (salvar imagens em /public/uploads) ====
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../public/uploads")); 
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

// ================= GET AGENDA =================
router.get('/aluno/:cod', (req, res) => {
  const codAluno = req.params.cod;

  const sql = `
    SELECT a.cod AS codAluno, a.nome, ag.cod AS agenda_id, a.foto
    FROM aluno a
    LEFT JOIN agenda ag ON ag.aluno_cod = a.cod
    WHERE a.cod = ?`;

  db.query(sql, [codAluno], (err, results) => {
    if (err || results.length === 0) {
      console.error(err);
      return res.status(404).send("Aluno não encontrado");
    }

    const aluno = results[0];

    function renderizarAgenda() {
      const sqlRecados = `SELECT cod, descricao, DATE_FORMAT(datar, "%Y-%m-%d") AS data, "Recado" AS tipo 
                          FROM recados WHERE agenda_id = ?`;
      const sqlEventos = `SELECT cod, descricao, DATE_FORMAT(datae, "%Y-%m-%d") AS data, "Evento" AS tipo 
                          FROM eventos WHERE agenda_id = ?`;
      const sqlFotos   = `SELECT cod, linkf AS descricao, DATE_FORMAT(datafotoa, "%Y-%m-%d") AS data, "Foto" AS tipo 
                          FROM fotosa WHERE agenda = ?`;

      db.query(sqlRecados, [aluno.agenda_id], (errRec, recados) => {
        if (errRec) recados = [];
        db.query(sqlEventos, [aluno.agenda_id], (errEvt, eventos) => {
          if (errEvt) eventos = [];
          db.query(sqlFotos, [aluno.agenda_id], (errFoto, fotos) => {
            if (errFoto) fotos = [];

            const todos = [...recados, ...eventos, ...fotos];
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

            res.render("agenda/index", {
              userImage: aluno.foto || "/imagens/perfil.png",
              nomeAluno: aluno.nome,
              selectedDate: null,
              agenda_id: aluno.agenda_id,
              recadosEventos,
              tipoUsuario: req.session.usuario?.tipo || null
            });
          });
        });
      });
    }

    if (!aluno.agenda_id) {
      const insertAgenda = 'INSERT INTO agenda (aluno_cod) VALUES (?)';
      db.query(insertAgenda, [aluno.codAluno], (errInsert, insertResult) => {
        if (errInsert) {
          console.error(errInsert);
          return res.status(500).send("Erro ao criar agenda do aluno");
        }
        aluno.agenda_id = insertResult.insertId;
        renderizarAgenda();
      });
    } else {
      renderizarAgenda();
    }
  });
});

// ================= POST AGENDA =================

// Adicionar recado
router.post('/adicionar-recado', verificarFuncionario, (req, res) => {
  const { descricao, data, agenda_id } = req.body;
  if (!descricao || !data || !agenda_id) return res.status(400).json({ erro: 'Campos obrigatórios' });

  const sql = 'INSERT INTO recados (descricao, datar, agenda_id) VALUES (?, ?, ?)';
  db.query(sql, [descricao, data, agenda_id], (err, result) => {
    if (err) return res.status(500).json({ erro: 'Erro ao inserir recado' });
    res.json({ sucesso: true, id: result.insertId });
  });
});

// Adicionar evento
router.post('/adicionar-evento', verificarFuncionario, (req, res) => {
  const { descricao, data, agenda_id } = req.body;
  if (!descricao || !data || !agenda_id) return res.status(400).json({ erro: 'Campos obrigatórios' });

  const sql = 'INSERT INTO eventos (descricao, datae, agenda_id) VALUES (?, ?, ?)';
  db.query(sql, [descricao, data, agenda_id], (err, result) => {
    if (err) return res.status(500).json({ erro: 'Erro ao inserir evento' });
    res.json({ sucesso: true, id: result.insertId });
  });
});

// Adicionar foto
router.post('/adicionar-foto', verificarFuncionario, upload.single("imagem"), (req, res) => {
  const { data, agenda_id } = req.body;
  if (!req.file) return res.status(400).json({ erro: "Nenhuma imagem enviada." });
  if (!data || !agenda_id) return res.status(400).json({ erro: "Campos obrigatórios" });

  const imageUrl = "/uploads/" + req.file.filename;

  const sql = "INSERT INTO fotosa (linkf, datafotoa, agenda) VALUES (?, ?, ?)";
  db.query(sql, [imageUrl, data, agenda_id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ erro: "Erro ao inserir foto" });
    }
    res.json({ sucesso: true, id: result.insertId, url: imageUrl });
  });
});

// ================= PUT AGENDA =================

// Editar recado
router.put('/recados/:cod', verificarFuncionario, (req, res) => {
  const { cod } = req.params;
  const { descricao } = req.body;

  const sql = 'UPDATE recados SET descricao = ? WHERE cod = ?';
  db.query(sql, [descricao, cod], (err, result) => {
    if (err) return res.status(500).json({ error: 'Erro ao editar recado' });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Recado não encontrado' });
    res.json({ message: 'Recado atualizado com sucesso!' });
  });
});

// Editar evento
router.put('/eventos/:cod', verificarFuncionario, (req, res) => {
  const { cod } = req.params;
  const { descricao } = req.body;

  const sql = 'UPDATE eventos SET descricao = ? WHERE cod = ?';
  db.query(sql, [descricao, cod], (err, result) => {
    if (err) return res.status(500).json({ error: 'Erro ao editar evento' });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Evento não encontrado' });
    res.json({ message: 'Evento atualizado com sucesso!' });
  });
});

// ================= DELETE AGENDA =================

// Excluir recado
router.delete('/recados/:cod', verificarFuncionario, (req, res) => {
  const { cod } = req.params;
  const sql = 'DELETE FROM recados WHERE cod = ?';
  db.query(sql, [cod], (err, result) => {
    if (err) return res.status(500).json({ error: 'Erro ao excluir recado' });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Recado não encontrado' });
    res.json({ message: 'Recado excluído com sucesso!' });
  });
});

// Excluir evento
router.delete('/eventos/:cod', verificarFuncionario, (req, res) => {
  const { cod } = req.params;
  const sql = 'DELETE FROM eventos WHERE cod = ?';
  db.query(sql, [cod], (err, result) => {
    if (err) return res.status(500).json({ error: 'Erro ao excluir evento' });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Evento não encontrado' });
    res.json({ message: 'Evento excluído com sucesso!' });
  });
});

// Excluir foto
router.delete('/fotos/:cod', verificarFuncionario, (req, res) => {
  const { cod } = req.params;
  const sqlSelect = 'SELECT linkf FROM fotosa WHERE cod = ?';
  db.query(sqlSelect, [cod], (err, results) => {
    if (err) return res.status(500).json({ error: 'Erro ao buscar foto' });
    if (results.length === 0) return res.status(404).json({ error: 'Foto não encontrada' });

    const filePath = path.join(__dirname, "../public", results[0].linkf);
    const sqlDelete = 'DELETE FROM fotosa WHERE cod = ?';
    db.query(sqlDelete, [cod], (errDelete, result) => {
      if (errDelete) return res.status(500).json({ error: 'Erro ao excluir foto' });

      // Apaga o arquivo físico (não trava se der erro)
      try { fs.unlinkSync(filePath); } catch(e) { console.warn("Erro ao excluir arquivo:", e.message); }

      res.json({ message: 'Foto excluída com sucesso!' });
    });
  });
});

module.exports = router;
