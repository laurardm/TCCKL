const express = require("express");
const router = express.Router();
const db = require("../../config/db");
const path = require("path");
const fs = require("fs");

const verificarFuncionario = require("../middlewares/verificarFuncionario");
const verificarTurmaDesarquivada = require("../middlewares/verificarTurmaDesarquivada");
const upload = require("../middlewares/multerConfig");

// GET /turmas/:nomeTurma/fotos
router.get("/:nomeTurma/fotos", (req, res) => {
  const nomeTurma = req.params.nomeTurma.trim().toUpperCase();

  db.query("SELECT cod, nome, arquivada FROM turma WHERE TRIM(UPPER(nome)) = ? ORDER BY arquivada ASC, cod DESC LIMIT 1", [nomeTurma], (err, turmaResults) => {
    if (err || turmaResults.length === 0) return res.status(404).json("Turma não encontrada");

    const codTurma = turmaResults[0].cod;

    db.query("SELECT * FROM fotos_turma WHERE turma_id = ? ORDER BY dataf DESC, cod DESC", [codTurma], (err2, fotos) => {
      if (err2) return res.status(500).json("Erro ao buscar fotos da turma");

      const tipoUsuario = req.session.usuario?.tipo === "funcionario" ? "func" :
                          req.session.usuario?.tipo === "responsavel" ? "resp" : null;

      const conteudos = fotos.map(f => ({
        tipo: "imagem",
        valor: f.link,
        cod: f.cod,
        dataf: f.dataf ? new Date(f.dataf).toISOString().split("T")[0] : new Date().toISOString().split("T")[0]
      }));

      res.render("turmas/fotosTurma", {
        encodedNomeTurma: encodeURIComponent(turmaResults[0].nome.trim()),
        dataTitulo: `Fotos da turma ${turmaResults[0].nome.trim()}`,
        conteudos,
        dataAtual: new Date().toISOString().split("T")[0],
        tipoUsuario,
        arquivada: turmaResults[0].arquivada
      });
    });
  });
});

// POST /turmas/:nomeTurma/fotos - adicionar foto
router.post("/:nomeTurma/fotos", verificarFuncionario, verificarTurmaDesarquivada, upload.single("foto"), (req, res) => {
  const arquivo = req.file;
  if (!arquivo) return res.status(400).json({ sucesso: false, erro: "Nenhum arquivo enviado" });

  const dataf = req.body.dataf
    ? new Date(req.body.dataf).toISOString().split("T")[0]
    : new Date().toISOString().split("T")[0];

  const linkFoto = "/uploads/" + arquivo.filename;

  db.query(
    "INSERT INTO fotos_turma (turma_id, link, dataf) VALUES (?, ?, ?)",
    [req.codTurma, linkFoto, dataf],
    (err2, result) => {
      if (err2) return res.status(500).json({ sucesso: false, erro: "Erro ao adicionar foto" });

      res.status(200).json({
        sucesso: true,
        cod: result.insertId,
        link: linkFoto,
        dataf,
      });
    }
  );
});

// DELETE /turmas/:nomeTurma/fotos/:cod - excluir foto
router.delete("/:nomeTurma/fotos/:cod", verificarFuncionario, verificarTurmaDesarquivada, (req, res) => {
  const { cod } = req.params;

  db.query("SELECT link FROM fotos_turma WHERE cod = ?", [cod], (err, results) => {
    if (err || results.length === 0)
      return res.status(404).json({ sucesso: false, erro: "Foto não encontrada" });

    const fotoPath = path.join(__dirname, "../public", results[0].link);

    db.query("DELETE FROM fotos_turma WHERE cod = ?", [cod], (err2) => {
      if (err2)
        return res.status(500).json({ sucesso: false, erro: "Erro ao excluir foto" });

      fs.unlink(fotoPath, (errFs) => {
        if (errFs) console.log("⚠️ Erro ao remover arquivo:", errFs);
      });

      res.status(200).json({ sucesso: true });
    });
  });
});

module.exports = router;