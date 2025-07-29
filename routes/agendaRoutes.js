const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Página inicial do responsável
router.get('/', (req, res) => {
  const user = req.session.usuario;

  res.render('agenda/index', {
    userImage: user?.foto || null,
    userName: user?.nome || null,
    selectedDate: null // <-- adiciona isso
  });
});

module.exports = router;