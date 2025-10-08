const express = require("express");
const router = express.Router();
const db = require("../../config/db");

const verificarFuncionario = require("../middlewares/verificarFuncionario");
const verificarTurmaDesarquivada = require("../middlewares/verificarTurmaDesarquivada");

// --- GET: Listar recados da turma --- //
router.get("/:nomeTurma/recados", (req, res) => {
  const nomeTurma = req.params.nomeTurma.trim().toUpperCase();

  db.query(
    "SELECT * FROM turma WHERE TRIM(UPPER(nome)) = ? AND arquivada = 0 ORDER BY cod DESC LIMIT 1",
    [nomeTurma],
    (err, turmaResults) => {
      if (err) return res.status(500).send("Erro ao buscar turma");
      if (turmaResults.length === 0) return res.status(404).send("Turma não encontrada");

      const turmaId = turmaResults[0].cod;

      db.query(
        "SELECT * FROM recados_turma WHERE turma_id = ?",
        [turmaId],
        (err, recados) => {
          if (err) return res.status(500).send("Erro ao buscar recados");

          const tipoUsuario =
            req.session.usuario?.tipo === "funcionario"
              ? "funcionario"
              : req.session.usuario?.tipo === "responsavel"
              ? "responsavel"
              : null;

          res.render("turmas/recadosTurma", {
            encodedNomeTurma: encodeURIComponent(turmaResults[0].nome.trim()),
            nomeTurma: turmaResults[0].nome.trim(),
            tituloPagina: `Recados da turma ${turmaResults[0].nome.trim()}`,
            conteudos: recados.map(r => ({
              cod: r.cod,
              data: r.datar,
              texto: r.descricao,
            })),
            dataAtual: new Date().toISOString().split("T")[0],
            tipoUsuario,
          });
        }
      );
    }
  );
});

// --- POST: Criar recado --- //
router.post("/:nomeTurma/recados", verificarFuncionario, verificarTurmaDesarquivada, (req, res) => {
    const { descricao, datar } = req.body;

    if (!descricao?.trim())
      return res.status(400).json({ sucesso: false, erro: "Descrição inválida" });

    db.query(
      "INSERT INTO recados_turma (turma_id, descricao, datar) VALUES (?, ?, ?)",
      [req.codTurma, descricao.trim(), datar || new Date().toISOString().split("T")[0]],
      (err, result) => {
        if (err) return res.status(500).json({ sucesso: false, erro: "Erro ao salvar recado" });

        res.status(200).json({
          sucesso: true,
          cod: result.insertId,
          descricao: descricao.trim(),
          datar: datar || new Date().toISOString().split("T")[0],
        });
      }
    );
  }
);

// --- DELETE: Excluir recado --- //
router.post("/:nomeTurma/recados/:cod/delete", verificarFuncionario, verificarTurmaDesarquivada, (req, res) => {
    const { nomeTurma, cod } = req.params;

    db.query("DELETE FROM recados_turma WHERE cod = ?", [cod], (err) => {
      if (err) return res.status(500).send("Erro ao excluir recado");

      res.redirect(`/turmas/${encodeURIComponent(nomeTurma)}/recados`);
    });
  }
);

// --- PUT: Atualizar recado --- //
router.post("/:nomeTurma/recados/:cod/edit", verificarFuncionario, verificarTurmaDesarquivada,(req, res) => {
    const { nomeTurma, cod } = req.params;
    const { descricao, datar } = req.body;

    db.query(
      "UPDATE recados_turma SET descricao = ?, datar = ? WHERE cod = ?",
      [descricao, datar, cod],
      (err) => {
        if (err) return res.status(500).send("Erro ao atualizar recado");

        res.redirect(`/turmas/${encodeURIComponent(nomeTurma)}/recados`);
      }
    );
  }
);

module.exports = router;
