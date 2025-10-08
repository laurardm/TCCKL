const express = require("express");
const router = express.Router();
const db = require("../../config/db");

// GET /turmas/arquivadas
router.get("/", (req, res) => {
  db.query("SELECT DISTINCT ano FROM turma WHERE arquivada = 1 ORDER BY ano DESC", (err, anos) => {
    if (err) return res.status(500).json("Erro ao buscar anos das turmas arquivadas");
    const turmas = Array.isArray(anos) ? anos.map(a => ({ ano: a.ano })) : [];
    res.render("turmas/arquivadas", { turmas, usuario: req.session.usuario });
  });
});

// Turmas arquivadas por ano
router.get("/:ano", (req, res) => {
  const ano = decodeURIComponent(req.params.ano);

  const query =
    ano === "Sem ano"
      ? "SELECT cod, nome, ano FROM turma WHERE arquivada = 1 AND (ano IS NULL OR ano = '') ORDER BY nome"
      : "SELECT cod, nome, ano FROM turma WHERE arquivada = 1 AND ano = ? ORDER BY nome";

  const params = ano === "Sem ano" ? [] : [ano];

  db.query(query, params, (err, turmas) => {
    if (err) return res.status(500).json("Erro ao buscar turmas arquivadas");
    res.render("turmas/arquivadas-ano", { turmas, ano, usuario: req.session.usuario });
  });
});

// Exibir alunos da turma arquivada
router.get("/:ano/:nomeTurma", (req, res) => {
  const { ano, nomeTurma } = req.params;
  const nomeTurmaUpper = nomeTurma.trim().toUpperCase();

  db.query(
    "SELECT cod, nome, arquivada FROM turma WHERE TRIM(UPPER(nome)) = ? AND (ano = ? OR (ano IS NULL AND ? = 'Sem ano')) AND arquivada = 1 ORDER BY cod DESC LIMIT 1",
    [nomeTurmaUpper, ano, ano],
    (err, turmaResults) => {
      if (err || turmaResults.length === 0)
        return res.render("turmas/turmanome", { nomeTurma, alunos: [], tipoUsuario: null });

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
          arquivada: true,
          ano,
        });
      });
    }
  );
});

// Fotos arquivadas
router.get("/:ano/:nomeTurma/fotos", (req, res) => {
  const { ano, nomeTurma } = req.params;
  const nomeTurmaUpper = nomeTurma.trim().toUpperCase();

  db.query(
    "SELECT * FROM turma WHERE TRIM(UPPER(nome)) = ? AND (ano = ? OR (ano IS NULL AND ? = 'Sem ano')) AND arquivada = 1 ORDER BY cod DESC LIMIT 1",
    [nomeTurmaUpper, ano, ano],
    (err, turmaResults) => {
      if (err) return res.status(500).send("Erro ao buscar turma arquivada");
      if (turmaResults.length === 0) return res.status(404).send("Turma arquivada não encontrada");

      const turmaId = turmaResults[0].cod;

      db.query("SELECT * FROM fotos_turma WHERE turma_id = ? ORDER BY dataf DESC, cod DESC", [turmaId], (err2, fotos) => {
        if (err2) return res.status(500).send("Erro ao buscar fotos arquivadas");

        const tipoUsuario =
          req.session.usuario?.tipo === "funcionario"
            ? "funcionario"
            : req.session.usuario?.tipo === "responsavel"
            ? "responsavel"
            : null;

        const conteudos = fotos.map(f => ({
          tipo: "imagem",
          valor: f.link,
          cod: f.cod,
          dataf: f.dataf ? new Date(f.dataf).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
        }));

        res.render("turmas/fotosTurma", {
          encodedNomeTurma: encodeURIComponent(turmaResults[0].nome.trim()),
          dataTitulo: `Fotos da turma ${turmaResults[0].nome.trim()} (${ano})`,
          conteudos,
          dataAtual: new Date().toISOString().split("T")[0],
          tipoUsuario,
          arquivada: true,
          ano,
        });
      });
    }
  );
});

// Recados arquivados
router.get("/:ano/:nomeTurma/recados", (req, res) => {
  const { ano, nomeTurma } = req.params;
  const nomeTurmaUpper = nomeTurma.trim().toUpperCase();

  db.query(
    "SELECT * FROM turma WHERE TRIM(UPPER(nome)) = ? AND (ano = ? OR (ano IS NULL AND ? = 'Sem ano')) AND arquivada = 1 ORDER BY cod DESC LIMIT 1",
    [nomeTurmaUpper, ano, ano],
    (err, turmaResults) => {
      if (err) return res.status(500).send("Erro ao buscar turma arquivada");
      if (turmaResults.length === 0) return res.status(404).send("Turma arquivada não encontrada");

      const turmaId = turmaResults[0].cod;

      db.query("SELECT * FROM recados_turma WHERE turma_id = ?", [turmaId], (err2, recados) => {
        if (err2) return res.status(500).send("Erro ao buscar recados arquivados");

        const tipoUsuario =
          req.session.usuario?.tipo === "funcionario"
            ? "funcionario"
            : req.session.usuario?.tipo === "responsavel"
            ? "responsavel"
            : null;

        res.render("turmas/recadosTurma", {
          encodedNomeTurma: encodeURIComponent(turmaResults[0].nome.trim()),
          nomeTurma: turmaResults[0].nome.trim(),
          tituloPagina: `Recados da turma ${turmaResults[0].nome.trim()} (${ano})`,
          conteudos: recados.map(r => ({
            cod: r.cod,
            data: r.datar,
            texto: r.descricao,
          })),
          dataAtual: new Date().toISOString().split("T")[0],
          tipoUsuario,
          arquivada: true,
          ano,
        });
      });
    }
  );
});

module.exports = router;
