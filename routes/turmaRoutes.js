const express = require("express");
const router = express.Router();
const db = require("../config/db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// --- Middleware ---
function verificarFuncionario(req, res, next) {
  if (req.session && req.session.usuario && req.session.usuario.tipo === "funcionario") {
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

//ROTAS DE TURMAS

// POST /turmas/criar
router.post("/criar", verificarFuncionario, (req, res) => {
  const { nome, ano } = req.body; // agora pegamos o ano também
  if (!nome?.trim()) return res.status(400).json({ sucesso: false, erro: "Nome inválido" });

  const anoFinal = ano?.trim() || null; // caso não selecione, fica NULL

  db.query(
    "INSERT INTO turma (nome, arquivada, ano) VALUES (?, 0, ?)",
    [nome.trim(), anoFinal],
    (err, result) => {
      if (err) {
        console.error("Erro ao criar turma:", err); // log para debug
        return res.status(500).json({ sucesso: false, erro: "Erro ao criar turma" });
      }
      res.status(200).json({ sucesso: true, cod: result.insertId, nome: nome.trim() });
    }
  );
});


// GET /turmas - listar turmas ativas
router.get("/", (req, res) => {
  db.query("SELECT cod, nome, arquivada FROM turma WHERE arquivada = 0 ORDER BY nome", (err, turmas) => {
    if (err) return res.status(500).json("Erro ao buscar turmas");
    res.render("turmas/index", { turmas, usuario: req.session.usuario });
  });
});

// PUT /turmas/arquivar-todas - arquiva todas as turmas ativas
router.put("/arquivar-todas", verificarFuncionario, (req, res) => {
  db.query("UPDATE turma SET arquivada = 1 WHERE arquivada = 0", (err, result) => {
    if (err) return res.status(500).json({ sucesso: false, erro: "Erro ao arquivar turmas" });
    res.status(200).json({ sucesso: true, modificadas: result.affectedRows });
  });
});

// GET /turmas/arquivadas - mostra apenas os anos disponíveis
router.get("/arquivadas", (req, res) => {
  db.query("SELECT DISTINCT ano FROM turma WHERE arquivada = 1 ORDER BY ano DESC", (err, anos) => {
    if (err) return res.status(500).json("Erro ao buscar anos das turmas arquivadas");
    // Montamos um array fake de turmas apenas com ano para reaproveitar o EJS
    const turmas = anos.map(a => ({ ano: a.ano }));
    res.render("turmas/arquivadas", { turmas, usuario: req.session.usuario });
  });
});

// GET /turmas/arquivadas/:ano - lista turmas arquivadas de um ano
router.get("/arquivadas/:ano", (req, res) => {
  const anoRaw = req.params.ano;
  const ano = decodeURIComponent(anoRaw);

  if (ano === "Sem ano") {
    db.query("SELECT cod, nome, ano FROM turma WHERE arquivada = 1 AND (ano IS NULL OR ano = '') ORDER BY nome", (err, turmas) => {
      if (err) return res.status(500).json("Erro ao buscar turmas arquivadas");
      res.render("turmas/arquivadas-ano", { turmas, ano, usuario: req.session.usuario });
    });
  } else {
    db.query("SELECT cod, nome, ano FROM turma WHERE arquivada = 1 AND ano = ? ORDER BY nome", [ano], (err, turmas) => {
      if (err) return res.status(500).json("Erro ao buscar turmas arquivadas");
      res.render("turmas/arquivadas-ano", { turmas, ano, usuario: req.session.usuario });
    });
  }
});

// PUT /turmas/arquivadas/:ano/desarquivar-todas - desarquiva todas as turmas DO ANO especificado
router.put("/arquivadas/:ano/desarquivar-todas", verificarFuncionario, (req, res) => {
  const anoRaw = req.params.ano;
  const ano = decodeURIComponent(anoRaw);

  if (ano === "Sem ano") {
    db.query("UPDATE turma SET arquivada = 0 WHERE arquivada = 1 AND (ano IS NULL OR ano = '')", (err, result) => {
      if (err) return res.status(500).json({ sucesso: false, erro: "Erro ao desarquivar turmas" });
      return res.status(200).json({ sucesso: true, modificadas: result.affectedRows });
    });
  } else {
    db.query("UPDATE turma SET arquivada = 0 WHERE arquivada = 1 AND ano = ?", [ano], (err, result) => {
      if (err) return res.status(500).json({ sucesso: false, erro: "Erro ao desarquivar turmas" });
      return res.status(200).json({ sucesso: true, modificadas: result.affectedRows });
    });
  }
});

// PUT /turmas/:cod/arquivar - arquivar/desarquivar turma 
router.put("/:cod/arquivar", verificarFuncionario, (req, res) => {
  const { cod } = req.params;
  const { arquivada } = req.body; 

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

/* ROTAS DE FOTOS DA TURMA*/

// GET /turmas/:nomeTurma/fotos
router.get("/:nomeTurma/fotos", (req, res) => {
  const nomeTurma = req.params.nomeTurma.trim().toUpperCase();

  db.query("SELECT cod, nome FROM turma WHERE TRIM(UPPER(nome)) = ? LIMIT 1", [nomeTurma], (err, turmaResults) => {
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
router.post("/:nomeTurma/fotos", verificarFuncionario, upload.single("foto"), (req, res) => {
  const nomeTurma = req.params.nomeTurma.trim().toUpperCase();
  const arquivo = req.file;

  if (!arquivo) return res.status(400).json({ sucesso: false, erro: "Nenhum arquivo enviado" });

  let dataf;
  if (req.body.dataf) {
    const dateObj = new Date(req.body.dataf);
    dataf = dateObj.toISOString().split("T")[0];
  } else {
    dataf = new Date().toISOString().split("T")[0];
  }

  db.query("SELECT cod FROM turma WHERE TRIM(UPPER(nome)) = ? LIMIT 1", [nomeTurma], (err, turmaResults) => {
    if (err || turmaResults.length === 0) 
      return res.status(404).json({ sucesso: false, erro: "Turma não encontrada" });

    const codTurma = turmaResults[0].cod;
    const linkFoto = "/uploads/" + arquivo.filename;

    db.query(
      "INSERT INTO fotos_turma (turma_id, link, dataf) VALUES (?, ?, ?)",
      [codTurma, linkFoto, dataf],
      (err2, result) => {
        if (err2) return res.status(500).json({ sucesso: false, erro: "Erro ao adicionar foto" });

        res.status(200).json({ 
          sucesso: true, 
          cod: result.insertId, 
          link: linkFoto, 
          dataf
        });
      }
    );
  });
});

// DELETE /turmas/:nomeTurma/fotos/:cod - excluir foto
router.delete("/:nomeTurma/fotos/:cod", verificarFuncionario, (req, res) => {
  const { cod } = req.params;

  db.query("SELECT link FROM fotos_turma WHERE cod = ?", [cod], (err, results) => {
    if (err || results.length === 0) return res.status(404).json({ sucesso: false, erro: "Foto não encontrada" });

    const fotoPath = path.join(__dirname, "../public", results[0].link);

    db.query("DELETE FROM fotos_turma WHERE cod = ?", [cod], (err2) => {
      if (err2) return res.status(500).json({ sucesso: false, erro: "Erro ao excluir foto" });

      fs.unlink(fotoPath, (errFs) => {
        if (errFs) console.log("⚠️ Erro ao remover arquivo:", errFs);
      });

      res.status(200).json({ sucesso: true });
    });
  });
});

/*RECADOS / AGENDA */

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

// GET recados da turma
router.get("/:nomeTurma/recados", (req, res) => {
  const { nomeTurma } = req.params;

  db.query("SELECT * FROM turma WHERE nome = ?", [nomeTurma], (err, turmaResults) => {
    if (err) return res.status(500).send("Erro ao buscar turma");
    if (turmaResults.length === 0) return res.status(404).send("Turma não encontrada");

    const turmaId = turmaResults[0].cod;

    db.query("SELECT * FROM recados_turma WHERE turma_id = ?", [turmaId], (err, recados) => {
      if (err) return res.status(500).send("Erro ao buscar recados");

      const tipoUsuario = req.session.usuario?.tipo === "funcionario" ? "funcionario" :
                          req.session.usuario?.tipo === "responsavel" ? "responsavel" : null;

      res.render("turmas/recadosTurma", {
        encodedNomeTurma: encodeURIComponent(turmaResults[0].nome.trim()),
        nomeTurma: turmaResults[0].nome.trim(),
        tituloPagina: `Recados da turma ${turmaResults[0].nome.trim()}`,
        conteudos: recados.map(r => ({
          cod: r.cod,
          data: r.datar,
          texto: r.descricao
        })),
        dataAtual: new Date().toISOString().split("T")[0],
        tipoUsuario
      });
    });
  });
});

// POST adicionar recado
router.post("/:nomeTurma/recados", verificarFuncionario, (req, res) => {
  const { nomeTurma } = req.params;
  const { descricao, datar } = req.body;

  db.query("SELECT * FROM turma WHERE nome = ?", [nomeTurma], (err, turmaResults) => {
    if (err) return res.status(500).send("Erro ao buscar turma");
    if (turmaResults.length === 0) return res.status(404).send("Turma não encontrada");

    const turmaId = turmaResults[0].cod;

    db.query(
      "INSERT INTO recados_turma (turma_id, descricao, datar) VALUES (?, ?, ?)",
      [turmaId, descricao, datar],
      (err) => {
        if (err) return res.status(500).send("Erro ao salvar recado");
        res.redirect(`/turmas/${encodeURIComponent(nomeTurma)}/recados`);
      }
    );
  });
});

// DELETE recado
router.post("/:nomeTurma/recados/:cod/delete", verificarFuncionario, (req, res) => {
  const { nomeTurma, cod } = req.params;

  db.query("DELETE FROM recados_turma WHERE cod = ?", [cod], (err) => {
    if (err) return res.status(500).send("Erro ao excluir recado");
    res.redirect(`/turmas/${encodeURIComponent(nomeTurma)}/recados`);
  });
});

// PUT atualizar recado
router.post("/:nomeTurma/recados/:cod/edit", verificarFuncionario, (req, res) => {
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
});

module.exports = router;
