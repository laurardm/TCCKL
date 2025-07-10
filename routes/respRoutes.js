const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Página inicial do responsável
router.get('/', (req, res) => {
  res.render('resp/index', {erro: null}); 
});

module.exports = router;
