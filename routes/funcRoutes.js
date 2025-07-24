const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', (req, res) => {
  const funcionario = req.session.usuario;

  if (!funcionario || !funcionario.cod) {
    return res.redirect('/');
  }

  const sql = 'SELECT foto FROM funcionario WHERE cod = ?';

  db.query(sql, [funcionario.cod], (err, results) => {
    if (err || results.length === 0) {
      console.error('Erro ao buscar foto:', err);
      return res.render('func/index', {
        erro: null,
        foto: '/imagens/perfil.png' // fallback
      });
    }

    const foto = results[0].foto || '/imagens/perfil.png';

    res.render('func/index', {
      erro: null,
      foto
    });
  });
});

module.exports = router;