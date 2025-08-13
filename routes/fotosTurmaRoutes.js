const express = require('express');
const router = express.Router();
const db = require('../config/db'); // ajuste o caminho se precisar

router.get('/:nomeTurma/fotos-turma', (req, res) => {
  const nomeTurmaParam = req.params.nomeTurma.trim().toUpperCase();

  const sqlTurma = "SELECT cod, nome FROM turma WHERE TRIM(UPPER(nome)) = ? LIMIT 1";

  db.query(sqlTurma, [nomeTurmaParam], (err, turmaResults) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Erro ao buscar turma');
    }
    if (turmaResults.length === 0) {
      return res.status(404).send('Turma não encontrada');
    }

    const codTurma = turmaResults[0].cod;

    const sqlFotosTurma = `
      SELECT f.cod, f.descricao, f.linkt 
      FROM fotost f
      JOIN turma t ON t.fotost = f.cod
      WHERE t.cod = ?
    `;

    db.query(sqlFotosTurma, [codTurma], (err2, fotos) => {
      if (err2) {
        console.error(err2);
        return res.status(500).send('Erro ao buscar fotos da turma');
      }

      res.render('fotos-turma', {
        nomeTurma: turmaResults[0].nome.trim(),
        fotos
      });
    });
  });
});

module.exports = router;
