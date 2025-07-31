const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Renderiza a página da agenda
router.get("/", (req, res) => {
  const user = req.session.usuario;
  if (!user || !user.cod) return res.redirect("/");

  // Pegue o primeiro aluno relacionado ao responsável para exemplo
  db.query(
    `SELECT a.cod FROM alu_resp ar
     JOIN aluno a ON ar.cod_aluno = a.cod
     WHERE ar.cod_resp = ?
     LIMIT 1`,
    [user.cod],
    (err, results) => {
      if (err || results.length === 0) {
        return res.render("agenda/index", {
          userImage: user.foto || "/img/foto-usuario.jpg",
          userName: user.nome,
          alunoId: null,
        });
      }

      const alunoId = results[0].cod;

      res.render("agenda/index", {
        userImage: user.foto || "/img/foto-usuario.jpg",
        userName: user.nome,
        alunoId,
      });
    }
  );
});

// Buscar agenda por aluno + data
router.get("/dados", (req, res) => {
  const { alunoId, data } = req.query;

  if (!alunoId || !data) return res.status(400).json({ erro: "Aluno e data obrigatórios" });

  const sql = `
    SELECT a.cod AS agendaCod, a.recados, a.eventos, f.linkf AS fotoLink, f.descricao AS fotoDesc
    FROM agenda a
    LEFT JOIN fotosa f ON a.fotosa = f.cod
    WHERE a.aluno = ? AND a.data = ?
  `;

  db.query(sql, [alunoId, data], (err, results) => {
    if (err) return res.status(500).json({ erro: "Erro no banco" });
    if (results.length === 0)
      return res.json({ recados: "", eventos: "", fotoLink: null, fotoDesc: null });

    res.json(results[0]);
  });
});

// Adicionar ou atualizar conteúdo na agenda
router.post("/adicionar", async (req, res) => {
  const user = req.session.usuario;
  const { alunoId, data, tipo, texto } = req.body;

  if (!user || !user.cod) return res.status(401).json({ erro: "Não autorizado" });
  if (!alunoId || !data || !tipo || !texto)
    return res.status(400).json({ erro: "Campos incompletos" });

  try {
    // Verifica se já existe agenda para esse aluno e data
    const [agendaRows] = await db.promise().query(
      "SELECT cod, recados, eventos, fotosa FROM agenda WHERE aluno = ? AND data = ?",
      [alunoId, data]
    );

    let agendaCod, recados = "", eventos = "", fotosa = null;

    if (agendaRows.length === 0) {
      const [insertResult] = await db.promise().query(
        "INSERT INTO agenda (aluno, data) VALUES (?, ?)",
        [alunoId, data]
      );
      agendaCod = insertResult.insertId;
    } else {
      agendaCod = agendaRows[0].cod;
      recados = agendaRows[0].recados || "";
      eventos = agendaRows[0].eventos || "";
      fotosa = agendaRows[0].fotosa;
    }

    if (tipo === "Recado") {
      recados = recados ? recados + "\n" + texto : texto;
      await db.promise().query("UPDATE agenda SET recados = ? WHERE cod = ?", [
        recados,
        agendaCod,
      ]);
    } else if (tipo === "Evento") {
      eventos = eventos ? eventos + "\n" + texto : texto;
      await db.promise().query("UPDATE agenda SET eventos = ? WHERE cod = ?", [
        eventos,
        agendaCod,
      ]);
    } else if (tipo === "Foto") {
      const [insertFoto] = await db.promise().query(
        "INSERT INTO fotosa (descricao, linkf) VALUES (?, ?)",
        [texto, "/img/foto-usuario.jpg"]
      );
      fotosa = insertFoto.insertId;
      await db.promise().query("UPDATE agenda SET fotosa = ? WHERE cod = ?", [
        fotosa,
        agendaCod,
      ]);
    } else {
      return res.status(400).json({ erro: "Tipo inválido" });
    }

    res.json({ sucesso: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro interno ao adicionar conteúdo" });
  }
});

module.exports = router;
