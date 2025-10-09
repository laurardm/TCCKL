const db = require("../../config/db");

module.exports = (req, res, next) => {
  const nomeTurma = req.params.nomeTurma.trim().toUpperCase();

  db.query(
    "SELECT cod FROM turma WHERE TRIM(UPPER(nome)) = ? AND arquivada = 0 ORDER BY cod DESC LIMIT 1",
    [nomeTurma],
    (err, results) => {
      if (err) return res.status(500).send("Erro ao verificar turma");
      if (results.length === 0) return res.status(404).send("Turma não encontrada");

      // Define o codTurma para ser usado na rota
      req.codTurma = results[0].cod;
      next();
    }
  );
};


