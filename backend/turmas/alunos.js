const express = require("express");
const router = express.Router();
const db = require("../../config/db");

const verificarFuncionario = require("../middlewares/verificarFuncionario");
const upload = require("../middlewares/multerConfig");

// GET agenda de um aluno
router.get("/aluno/:cod", (req, res) => {
  const codAluno = req.params.cod;

  db.query("SELECT cod, nome, agenda, foto FROM aluno WHERE cod = ?", [codAluno], (err, results) => {
    if (err || results.length === 0) return res.status(404).json("Aluno não encontrado");

    const aluno = results[0];

    res.render("agenda/index", {
      userImage: aluno.foto || "/imagens/perfil.png",
      nomeAluno: aluno.nome,
      selectedDate: null,
    });
  });
});

// Exibir alunos de turma ativa
router.get("/:nomeTurma", (req, res) => {
  const nomeTurma = req.params.nomeTurma.trim().toUpperCase();

  db.query(
    "SELECT cod, nome, arquivada, ano FROM turma WHERE TRIM(UPPER(nome)) = ? ORDER BY arquivada ASC, cod DESC LIMIT 1",
    [nomeTurma],
    (err, turmaResults) => {
      if (err || turmaResults.length === 0)
        return res.render("turmas/turmanome", { nomeTurma: req.params.nomeTurma, alunos: [], tipoUsuario: null });

      const codTurma = turmaResults[0].cod;

      db.query("SELECT cod, nome, agenda, foto FROM aluno WHERE turma = ? ORDER BY nome", [codTurma], (err2, alunos) => {
        if (err2)
          return res.render("turmas/turmanome", { nomeTurma: turmaResults[0].nome.trim(), alunos: [], tipoUsuario: null });

        const tipoUsuario =
          req.session.usuario?.tipo === "funcionario"
            ? "func"
            : req.session.usuario?.tipo === "responsavel"
            ? "resp"
            : null;

        res.render("turmas/turmanome", {
          nomeTurma: turmaResults[0].nome.trim(),
          alunos,
          tipoUsuario,
          arquivada: turmaResults[0].arquivada,
          ano: turmaResults[0].ano,
        });
      });
    }
  );
});

// POST /turmas/:nomeTurma - adicionar aluno
router.post("/:nomeTurma", verificarFuncionario, (req, res) => {
  const { nome } = req.body;
  const nomeTurma = req.params.nomeTurma.trim().toUpperCase();
  if (!nome?.trim()) return res.status(400).json("Nome inválido");

  db.query("SELECT cod, arquivada FROM turma WHERE TRIM(UPPER(nome)) = ? ORDER BY arquivada ASC, cod DESC LIMIT 1", [nomeTurma], (err, result) => {
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

// PUT /turmas/:nomeTurma - editar aluno
router.put("/:nomeTurma", verificarFuncionario, (req, res) => {
  const { cod, nome } = req.body;
  if (!cod || !nome) return res.status(400).json("Dados inválidos");

  db.query("UPDATE aluno SET nome = ? WHERE cod = ?", [nome.trim(), cod], (err) => {
    if (err) return res.status(500).json("Erro ao editar aluno");
    res.status(200).json("Aluno atualizado");
  });
});

// DELETE /turmas/:nomeTurma/:cod - excluir aluno
router.delete("/:nomeTurma/:cod", verificarFuncionario, (req, res) => {
  const { cod } = req.params;

  db.query("DELETE FROM aluno WHERE cod = ?", [cod], (err) => {
    if (err) return res.status(500).json("Erro ao excluir aluno");
    res.status(200).json("Aluno excluído");
  });
});

// POST /turmas/alunos/alterar-foto - alterar foto do aluno
router.post("/alunos/alterar-foto", verificarFuncionario, upload.single("foto"), (req, res) => {
  const codAluno = req.body.cod;
  const novaFoto = req.file?.filename;
  if (!codAluno || !novaFoto) return res.status(400).json("Dados incompletos");

  const fotoLink = "/uploads/" + novaFoto;
  db.query("UPDATE aluno SET foto = ? WHERE cod = ?", [fotoLink, codAluno], (err) => {
    if (err) return res.status(500).json("Erro ao atualizar foto");
    res.status(200).json({ novaFoto: fotoLink });
  });
});

module.exports = router;