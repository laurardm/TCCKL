const express = require("express");
const router = express.Router();
const db = require("../config/db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// --- Middleware ---
function verificarFuncionario(req, res, next) {
  if (req.session.usuario && req.session.usuario.tipo === "funcionario") {
    return next();
  }
  return res.status(403).json("Acesso negado: apenas funcionários podem realizar esta ação.");
}

// --- Configuração do multer ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "public/uploads/"),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

/* ===========================
   ROTAS DE TURMAS
=========================== */

// GET /turmas - listar turmas ativas
router.get("/", (req, res) => {
  db.query("SELECT cod, nome, arquivada FROM turma WHERE arquivada = 0 ORDER BY nome", (err, turmas) => {
    if (err) return res.status(500).json("Erro ao buscar turmas");
    res.render("turmas/index", { turmas, usuario: req.session.usuario });
  });
});

// GET /turmas/arquivadas - listar turmas arquivadas
router.get("/arquivadas", (req, res) => {
  db.query("SELECT cod, nome, arquivada FROM turma WHERE arquivada = 1 ORDER BY nome", (err, turmas) => {
    if (err) return res.status(500).json("Erro ao buscar turmas arquivadas");
    res.render("turmas/arquivadas", { turmas, usuario: req.session.usuario });
  });
});

// PUT /turmas/:cod/arquivar - arquivar/desarquivar turma
router.put("/:cod/arquivar", verificarFuncionario, (req, res) => {
  const { cod } = req.params;
  const { arquivada } = req.body; // 1 = arquivar, 0 = desarquivar

  db.query("UPDATE turma SET arquivada = ? WHERE cod = ?", [arquivada, cod], (err) => {
    if (err) return res.status(500).json("Erro ao atualizar status da turma");
    res.status(200).json({ sucesso: true, arquivada });
  });
});

// GET /turmas/:nomeTurma - exibir alunos da turma
router.get("/:nomeTurma", (req, res) => {
  const nomeTurma = req.params.nomeTurma.trim().toUpperCase();

  db.query("SELECT cod, nome, arquivada FROM turma WHERE TRIM(UPPER(nome)) = ? LIMIT 1", [nomeTurma], (err, turmaResults) => {
    if (err || turmaResults.length === 0) {
      return res.render("turmas/turmanome", { nomeTurma: req.params.nomeTurma, alunos: [], tipoUsuario: null });
    }

    const codTurma = turmaResults[0].cod;

    db.query("SELECT cod, nome, agenda, foto FROM aluno WHERE turma = ? ORDER BY nome", [codTurma], (err2, alunos) => {
      if (err2) return res.render("turmas/turmanome", { nomeTurma: turmaResults[0].nome.trim(), alunos: [], tipoUsuario: null });

      const tipoUsuario = req.session.usuario?.tipo === "funcionario" ? "func" :
                          req.session.usuario?.tipo === "responsavel" ? "resp" : null;

      res.render("turmas/turmanome", {
        nomeTurma: turmaResults[0].nome.trim(),
        alunos,
        tipoUsuario,
        arquivada: turmaResults[0].arquivada
      });
    });
  });
});

// POST /turmas/:nomeTurma - adicionar aluno
router.post("/:nomeTurma", verificarFuncionario, (req, res) => {
  const { nome } = req.body;
  const nomeTurma = req.params.nomeTurma.trim().toUpperCase();
  if (!nome?.trim()) return res.status(400).json("Nome inválido");

  db.query("SELECT cod, arquivada FROM turma WHERE TRIM(UPPER(nome)) = ? LIMIT 1", [nomeTurma], (err, result) => {
    if (err || result.length === 0) return res.status(400).json("Turma não encontrada");
    if (result[0].arquivada) return res.status(400).json("Turma arquivada: não é possível adicionar alunos");

    const codTurma = result[0].cod;

    db.query("INSERT INTO aluno (nome, turma) VALUES (?, ?)", [nome.trim(), codTurma], (err2, resultInsertAluno) => {
      if (err2) return res.status(500).json("Erro ao adicionar aluno");

      const codAluno = resultInsertAluno.insertId;

      db.query("INSERT INTO agenda (aluno_cod) VALUES (?)", [codAluno], (err3, resultInsertAgenda) => {
        if (err3) return res.status(500).json("Erro ao criar agenda do aluno");

        const codAgenda = resultInsertAgenda.insertId;

        db.query("UPDATE aluno SET agenda = ? WHERE cod = ?", [codAgenda, codAluno], (err4) => {
          if (err4) return res.status(500).json("Erro ao vincular agenda ao aluno");

          res.status(200).json({ cod: codAluno, nome: nome.trim(), foto: null, agenda: codAgenda });
        });
      });
    });
  });
});

// ... (restante do seu código de alunos, fotos, recados permanece igual)
// Apenas adicionei checagem para turma arquivada no insert de alunos acima.

module.exports = router;
