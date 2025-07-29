const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Middleware para permitir só funcionários nas rotas que alteram dados
function verificarFuncionario(req, res, next) {
  if (req.session.usuario && req.session.usuario.tipo === 'funcionario') {
    next();
  } else {
    res.status(403).send("Acesso negado: apenas funcionários podem realizar esta ação.");
  }
}

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

  const sqlTurma =
    "SELECT cod, nome FROM turma WHERE TRIM(UPPER(nome)) = ? LIMIT 1";

  db.query(sqlTurma, [nomeTurmaParam], (err, turmaResults) => {
    if (err || turmaResults.length === 0) {
      return res.render("turmas/turmanome", { nomeTurma: req.params.nomeTurma, alunos: [], tipoUsuario: null });
    }

    const codTurma = turmaResults[0].cod;

    const sqlAlunos = `
      SELECT a.cod, a.nome, a.agenda, f.linkf AS foto
      FROM aluno a
      LEFT JOIN agenda ag ON a.agenda = ag.cod
      LEFT JOIN fotosa f ON ag.fotosa = f.cod
      WHERE a.turma = ?
    `;

    db.query(sqlAlunos, [codTurma], (err2, alunos) => {
      if (err2) {
        return res.render("turmas/turmanome", { nomeTurma: turmaResults[0].nome.trim(), alunos: [], tipoUsuario: null });
      }

      // Define tipoUsuario baseado na sessão.usuario.tipo
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

// POST - Adicionar aluno (somente funcionário)
router.post('/:nomeTurma', verificarFuncionario, (req, res) => {
  const { nome, agenda } = req.body;
  const nomeTurma = req.params.nomeTurma.trim().toUpperCase();

  const sqlTurma = 'SELECT cod FROM turma WHERE TRIM(UPPER(nome)) = ? LIMIT 1';
  db.query(sqlTurma, [nomeTurma], (err, result) => {
    if (err || result.length === 0) return res.status(400).send('Turma não encontrada');

    const codTurma = result[0].cod;
    const sqlInsert = 'INSERT INTO aluno (nome, turma) VALUES (?, ?)';
    db.query(sqlInsert, [nome, codTurma || null], (err2, resultInsert) => {
      if (err2) return res.status(500).send('Erro ao adicionar aluno');
      
      res.status(200).json({ cod: resultInsert.insertId, nome });
    });
  });
});

// PUT - Editar aluno (somente funcionário)
router.put("/:nomeTurma", verificarFuncionario, (req, res) => {
  const { cod, nome } = req.body;
  const sqlUpdate = "UPDATE aluno SET nome = ? WHERE cod = ?";

  db.query(sqlUpdate, [nome, cod], (err) => {
    if (err) return res.status(500).send("Erro ao editar aluno");
    res.status(200).send("Aluno atualizado");
  });
});

// DELETE - Excluir aluno (somente funcionário)
router.delete("/:nomeTurma", verificarFuncionario, (req, res) => {
  const { cod } = req.body;
  const sqlDelete = "DELETE FROM aluno WHERE cod = ?";

  db.query(sqlDelete, [cod], (err) => {
    if (err) return res.status(500).send("Erro ao excluir aluno");
    res.status(200).send("Aluno excluído");
  });
});

module.exports = router;
