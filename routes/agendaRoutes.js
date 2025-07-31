const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', (req, res) => {
  const alunoCod = req.query.aluno;

  if (!alunoCod) {
    return res.render('agenda/index', {
      nomeAluno: 'não definido',
      userImage: null,
      userName: null
    });
  }

  const sql = 'SELECT nome FROM aluno WHERE cod = ?';

  db.query(sql, [alunoCod], (err, results) => {
    if (err) {
      console.error('Erro ao buscar aluno:', err);
      return res.render('agenda/index', {
        nomeAluno: 'não definido',
        userImage: null,
        userName: null
      });
    }

    if (results.length === 0) {
      return res.render('agenda/index', {
        nomeAluno: 'não definido',
        userImage: null,
        userName: null
      });
    }

    const nomeAluno = results[0].nome;
    console.log('Aluno encontrado:', nomeAluno);

    res.render('agenda/index', {
      nomeAluno,
      userImage: null,
      userName: null
    });
  });
});


module.exports = router;
