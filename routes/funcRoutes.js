const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Página inicial do funcionário
router.get('/', (req, res) => {
  res.render('func/index', {erro: null}); 
});

module.exports = router;
