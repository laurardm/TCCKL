const express = require("express");
const router = express.Router();
const db = require("../config/db");
const multer = require("multer");
const path = require("path");


router.get("/fotos-turma/:nomeTurma", (req, res) => {
  const nomeTurma = req.params.nomeTurma.trim().toUpperCase();

  const sql = `
    SELECT f.caminho
    FROM fotos_turma f
    INNER JOIN turma t ON t.cod = f.turma_cod
    WHERE TRIM(UPPER(t.nome)) = ?
    ORDER BY f.data_upload DESC
  `;

  db.query(sql, [nomeTurma], (err, fotos) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Erro ao buscar fotos da turma");
    }
    res.render("fotos/turma", { nomeTurma, fotos });
  });
});

// Middleware para permitir só funcionários nas rotas que alteram dados
function verificarFuncionario(req, res, next) {
  if (req.session.usuario && req.session.usuario.tipo === 'funcionario') {
    next();
  } else {
    res.status(403).send("Acesso negado: apenas funcionários podem realizar esta ação.");
  }
}

// Configuração do multer para upload de fotos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// --- ROTAS DE TURMAS ---
// GET /turmas - listar turmas
router.get("/", (req, res) => {
  const sql = "SELECT nome FROM turma ORDER BY nome";
  db.query(sql, (err, turmas) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Erro ao buscar turmas");
    }
    res.render("turmas/index", { turmas });
  });
});

// GET /turmas/:nomeTurma - exibir alunos da turma e tipoUsuario para controle front
router.get("/:nomeTurma", (req, res) => {
  const nomeTurmaParam = req.params.nomeTurma.trim().toUpperCase();

  const sqlTurma = "SELECT cod, nome FROM turma WHERE TRIM(UPPER(nome)) = ? LIMIT 1";

  db.query(sqlTurma, [nomeTurmaParam], (err, turmaResults) => {
    if (err || turmaResults.length === 0) {
      return res.render("turmas/turmanome", { nomeTurma: req.params.nomeTurma, alunos: [], tipoUsuario: null });
    }

    const codTurma = turmaResults[0].cod;

    const sqlAlunos = `
      SELECT a.cod, a.nome, a.agenda, a.foto
      FROM aluno a
      WHERE a.turma = ?
      ORDER BY a.nome
    `;

    db.query(sqlAlunos, [codTurma], (err2, alunos) => {
      if (err2) {
        console.error(err2);
        return res.render("turmas/turmanome", { nomeTurma: turmaResults[0].nome.trim(), alunos: [], tipoUsuario: null });
      }

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

// POST - Adicionar aluno (somente funcionário) com criação automática de agenda
router.post('/:nomeTurma', verificarFuncionario, (req, res) => {
  const { nome } = req.body;
  const nomeTurma = req.params.nomeTurma.trim().toUpperCase();

  if (!nome || !nome.trim()) return res.status(400).send('Nome inválido');

  const sqlTurma = 'SELECT cod FROM turma WHERE TRIM(UPPER(nome)) = ? LIMIT 1';
  db.query(sqlTurma, [nomeTurma], (err, result) => {
    if (err || result.length === 0) {
      console.error(err);
      return res.status(400).send('Turma não encontrada');
    }

    const codTurma = result[0].cod;

    // 1️⃣ Inserir aluno sem agenda
    const sqlInsertAluno = 'INSERT INTO aluno (nome, turma) VALUES (?, ?)';
    db.query(sqlInsertAluno, [nome.trim(), codTurma], (err2, resultInsertAluno) => {
      if (err2) {
        console.error(err2);
        return res.status(500).send('Erro ao adicionar aluno');
      }

      const codAluno = resultInsertAluno.insertId;

      // 2️⃣ Criar agenda para o aluno
      const sqlInsertAgenda = 'INSERT INTO agenda (aluno_cod) VALUES (?)';
      db.query(sqlInsertAgenda, [codAluno], (err3, resultInsertAgenda) => {
        if (err3) {
          console.error(err3);
          return res.status(500).send('Erro ao criar agenda do aluno');
        }

        const codAgenda = resultInsertAgenda.insertId;

        // 3️⃣ Atualizar aluno com a agenda criada
        const sqlUpdateAluno = 'UPDATE aluno SET agenda = ? WHERE cod = ?';
        db.query(sqlUpdateAluno, [codAgenda, codAluno], (err4) => {
          if (err4) {
            console.error(err4);
            return res.status(500).send('Erro ao vincular agenda ao aluno');
          }

          // Retorna tudo já pronto para o frontend
          res.status(200).json({ 
            cod: codAluno, 
            nome: nome.trim(), 
            foto: null, 
            agenda: codAgenda 
          });
        });
      });
    });
  });
});


// PUT - Editar aluno (somente funcionário)
router.put("/:nomeTurma", verificarFuncionario, (req, res) => {
  const { cod, nome } = req.body;
  if (!cod || !nome) return res.status(400).send("Dados inválidos");

  const sqlUpdate = "UPDATE aluno SET nome = ? WHERE cod = ?";
  db.query(sqlUpdate, [nome.trim(), cod], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Erro ao editar aluno");
    }
    res.status(200).send("Aluno atualizado");
  });
});

// DELETE - Excluir aluno (somente funcionário)
router.delete("/:nomeTurma", verificarFuncionario, (req, res) => {
  const { cod } = req.body;
  if (!cod) return res.status(400).send("Código inválido");

  const sqlDelete = "DELETE FROM aluno WHERE cod = ?";
  db.query(sqlDelete, [cod], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Erro ao excluir aluno");
    }
    res.status(200).send("Aluno excluído");
  });
});

// POST - Alterar foto do aluno (somente funcionário)
router.post("/alunos/alterar-foto", verificarFuncionario, upload.single("foto"), (req, res) => {
  const codAluno = req.body.cod;
  const novaFoto = req.file?.filename;

  if (!codAluno || !novaFoto) {
    return res.status(400).send("Dados incompletos");
  }

  const fotoLink = "/uploads/" + novaFoto;

  const sql = "UPDATE aluno SET foto = ? WHERE cod = ?";

  db.query(sql, [fotoLink, codAluno], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Erro ao atualizar foto");
    }
    res.status(200).json({ novaFoto: fotoLink });
  });
});

// --- ROTA DA AGENDA ---
// GET /agenda/aluno/:cod - Exibir agenda do aluno
router.get('/aluno/:cod', (req, res) => {
  const codAluno = req.params.cod;

  const sql = "SELECT cod, nome, agenda, foto FROM aluno WHERE cod = ?";
  db.query(sql, [codAluno], (err, results) => {
    if (err || results.length === 0) {
      console.error(err);
      return res.status(404).send("Aluno não encontrado");
    }

    const aluno = results[0];

    res.render("agenda/index", {
      userImage: aluno.foto || "/imagens/perfil.png",
      nomeAluno: aluno.nome,
      selectedDate: null
    });
  });
});




module.exports = router;

