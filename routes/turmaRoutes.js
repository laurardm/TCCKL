const express = require("express");
const router = express.Router();
const db = require("../config/db");
const multer = require("multer");
const path = require("path");

// Middleware para permitir só funcionários nas rotas que alteram dados
function verificarFuncionario(req, res, next) {
  if (req.session.usuario && req.session.usuario.tipo === "funcionario") {
    next();
  } else {
    res.status(403).send("Acesso negado: apenas funcionários podem realizar esta ação.");
  }
}

// Configuração do multer para upload de fotos
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "public/uploads/"),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// --- ROTAS DE TURMAS ---
// GET /turmas - listar turmas
router.get("/", (req, res) => {
  db.query("SELECT nome FROM turma ORDER BY nome", (err, turmas) => {
    if (err) return res.status(500).send("Erro ao buscar turmas");
    res.render("turmas/index", { turmas });
  });
});

// GET /turmas/:nomeTurma - exibir alunos da turma
router.get("/:nomeTurma", (req, res) => {
  const nomeTurma = req.params.nomeTurma.trim().toUpperCase();

  db.query("SELECT cod, nome FROM turma WHERE TRIM(UPPER(nome)) = ? LIMIT 1", [nomeTurma], (err, turmaResults) => {
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
      });
    });
  });
});

// POST - Adicionar aluno (somente funcionário) com criação de agenda
router.post("/:nomeTurma", verificarFuncionario, (req, res) => {
  const { nome } = req.body;
  const nomeTurma = req.params.nomeTurma.trim().toUpperCase();
  if (!nome?.trim()) return res.status(400).send("Nome inválido");

  db.query("SELECT cod FROM turma WHERE TRIM(UPPER(nome)) = ? LIMIT 1", [nomeTurma], (err, result) => {
    if (err || result.length === 0) return res.status(400).send("Turma não encontrada");

    const codTurma = result[0].cod;

    db.query("INSERT INTO aluno (nome, turma) VALUES (?, ?)", [nome.trim(), codTurma], (err2, resultInsertAluno) => {
      if (err2) return res.status(500).send("Erro ao adicionar aluno");

      const codAluno = resultInsertAluno.insertId;

      db.query("INSERT INTO agenda (aluno_cod) VALUES (?)", [codAluno], (err3, resultInsertAgenda) => {
        if (err3) return res.status(500).send("Erro ao criar agenda do aluno");

        const codAgenda = resultInsertAgenda.insertId;

        db.query("UPDATE aluno SET agenda = ? WHERE cod = ?", [codAgenda, codAluno], (err4) => {
          if (err4) return res.status(500).send("Erro ao vincular agenda ao aluno");

          res.status(200).json({ cod: codAluno, nome: nome.trim(), foto: null, agenda: codAgenda });
        });
      });
    });
  });
});

// PUT - Editar aluno
router.put("/:nomeTurma", verificarFuncionario, (req, res) => {
  const { cod, nome } = req.body;
  if (!cod || !nome) return res.status(400).send("Dados inválidos");

  db.query("UPDATE aluno SET nome = ? WHERE cod = ?", [nome.trim(), cod], (err) => {
    if (err) return res.status(500).send("Erro ao editar aluno");
    res.status(200).send("Aluno atualizado");
  });
});

// DELETE - Excluir aluno
router.delete("/:nomeTurma", verificarFuncionario, (req, res) => {
  const { cod } = req.body;
  if (!cod) return res.status(400).send("Código inválido");

  db.query("DELETE FROM aluno WHERE cod = ?", [cod], (err) => {
    if (err) return res.status(500).send("Erro ao excluir aluno");
    res.status(200).send("Aluno excluído");
  });
});

// POST - Alterar foto do aluno
router.post("/alunos/alterar-foto", verificarFuncionario, upload.single("foto"), (req, res) => {
  const codAluno = req.body.cod;
  const novaFoto = req.file?.filename;
  if (!codAluno || !novaFoto) return res.status(400).send("Dados incompletos");

  const fotoLink = "/uploads/" + novaFoto;
  db.query("UPDATE aluno SET foto = ? WHERE cod = ?", [fotoLink, codAluno], (err) => {
    if (err) return res.status(500).send("Erro ao atualizar foto");
    res.status(200).json({ novaFoto: fotoLink });
  });
});

// --- ROTAS DE FOTOS DA TURMA ---
// GET /turmas/:nomeTurma/fotos
router.get("/:nomeTurma/fotos", (req, res) => {
  const nomeTurma = req.params.nomeTurma.trim().toUpperCase();

  db.query("SELECT cod, nome FROM turma WHERE TRIM(UPPER(nome)) = ? LIMIT 1", [nomeTurma], (err, turmaResults) => {
    if (err || turmaResults.length === 0) return res.status(404).send("Turma não encontrada");

    const codTurma = turmaResults[0].cod;

    db.query("SELECT * FROM fotos_turma WHERE turma_id = ? ORDER BY cod DESC", [codTurma], (err2, fotos) => {
      if (err2) return res.status(500).send("Erro ao buscar fotos da turma");

      res.render("turmas/fotosTurma", {
        encodedNomeTurma: encodeURIComponent(turmaResults[0].nome.trim()),
        dataTitulo: `Fotos da turma ${turmaResults[0].nome.trim()}`,
        conteudos: fotos.map(f => ({ tipo: "imagem", valor: f.link })),
        dataAtual: new Date().toISOString().split("T")[0],
      });
    });
  });
});

// POST /turmas/:nomeTurma/fotos - adicionar foto da turma
router.post("/:nomeTurma/fotos", verificarFuncionario, upload.single("foto"), (req, res) => {
  const nomeTurma = req.params.nomeTurma.trim().toUpperCase();
  const arquivo = req.file;
  if (!arquivo) return res.status(400).send("Nenhum arquivo enviado");

  db.query("SELECT cod FROM turma WHERE TRIM(UPPER(nome)) = ? LIMIT 1", [nomeTurma], (err, turmaResults) => {
    if (err || turmaResults.length === 0) return res.status(404).send("Turma não encontrada");

    const codTurma = turmaResults[0].cod;
    const linkFoto = "/uploads/" + arquivo.filename;

    db.query("INSERT INTO fotos_turma (turma_id, link, descricao) VALUES (?, ?, ?)", [codTurma, linkFoto, null], (err2) => {
      if (err2) return res.status(500).send("Erro ao adicionar foto");
      res.status(200).json({ sucesso: true, link: linkFoto });
    });
  });
});

// --- ROTA DA AGENDA ---
// GET /agenda/aluno/:cod
router.get("/aluno/:cod", (req, res) => {
  const codAluno = req.params.cod;

  db.query("SELECT cod, nome, agenda, foto FROM aluno WHERE cod = ?", [codAluno], (err, results) => {
    if (err || results.length === 0) return res.status(404).send("Aluno não encontrado");

    const aluno = results[0];

    res.render("agenda/index", {
      userImage: aluno.foto || "/imagens/perfil.png",
      nomeAluno: aluno.nome,
      selectedDate: null,
    });
  });
});

module.exports = router;
