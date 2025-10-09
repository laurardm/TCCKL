const express = require("express");
const router = express.Router();
const db = require("../../config/db");
const verificarFuncionario = require("../middlewares/verificarFuncionario");

// POST /turmas/criar
router.post("/criar", verificarFuncionario, (req, res) => {
  const { nome, ano } = req.body;
  if (!nome?.trim()) return res.status(400).json({ sucesso: false, erro: "Nome inválido" });

  const anoFinal = ano?.trim() || null;
  db.query("INSERT INTO turma (nome, arquivada, ano) VALUES (?, 0, ?)", [nome.trim(), anoFinal], (err, result) => {
    if (err) return res.status(500).json({ sucesso: false, erro: "Erro ao criar turma" });
    res.status(200).json({ sucesso: true, cod: result.insertId, nome: nome.trim() });
  });
});

// GET /turmas
router.get("/", (req, res) => {
  db.query("SELECT cod, nome, ano, arquivada FROM turma WHERE arquivada = 0 ORDER BY ano DESC, nome", (err, turmas) => {
    if (err) return res.status(500).json("Erro ao buscar turmas");
    res.render("turmas/index", { turmas, usuario: req.session.usuario });
  });
});

// PUT /turmas/arquivar-todas
router.put("/arquivar-todas", verificarFuncionario, (req, res) => {
  db.query("UPDATE turma SET arquivada = 1 WHERE arquivada = 0", (err, result) => {
    if (err) return res.status(500).json({ sucesso: false, erro: "Erro ao arquivar turmas" });
    res.status(200).json({ sucesso: true, modificadas: result.affectedRows });
  });
});
    


module.exports = router;
