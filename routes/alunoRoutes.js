const express = require('express');
const router = express.Router({ mergeParams: true });
const db = require('../config/db');

// Middleware para só permitir funcionário editar
function verificarFuncionario(req, res, next) {
  if (req.session && req.session.usuario && req.session.usuario.tipo === 'funcionario') {
    next();
  } else {
    res.status(403).send("Acesso negado: apenas funcionários podem editar.");
  }
}

// GET aluno pelo código e nome da turma
router.get('/:cod', (req, res) => {
  const { cod, nomeTurma } = req.params;
  const sql = `
    SELECT aluno.*, turma.nome AS nome_turma
    FROM aluno
    LEFT JOIN turma ON turma.cod = aluno.turma
    WHERE aluno.cod = ? AND turma.nome = ?`;

  db.query(sql, [cod, nomeTurma], (err, resultados) => {
    if (err || resultados.length === 0) {
      return res.send("Erro ao carregar aluno ou aluno não encontrado na turma.");
    }

    const tipoUsuario = req.session.usuario ? req.session.usuario.tipo : null;

    res.render('aluno/aluno', { aluno: resultados[0], tipoUsuario, erro: null });
  });
});

// POST para atualizar aluno (nome + foto base64) — só funcionário
router.post('/:cod', verificarFuncionario, (req, res) => {
  const { cod, nomeTurma } = req.params;
  const { nome, foto } = req.body;

  // Validação simples
  if (!nome || nome.trim() === '') {
    return res.status(400).send('Nome do aluno é obrigatório.');
  }

  // Pode receber foto em base64 ou null
  const sql = `UPDATE aluno SET nome = ?, foto = ? WHERE cod = ?`;

  db.query(sql, [nome.trim(), foto || null, cod], (err) => {
    if (err) {
      console.error("Erro ao atualizar aluno:", err);
      return res.status(500).send("Erro ao atualizar aluno.");
    }
    res.status(200).send("Aluno atualizado com sucesso.");
  });
});


module.exports = router;
