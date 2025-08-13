const express = require('express');
const router = express.Router();
const db = require('../config/db'); // ajuste o caminho se precisar

router.get('/', (req, res) => {
  res.render('turmas/fotosturma', { erro: null, sucesso: null });
});

module.exports = router;
