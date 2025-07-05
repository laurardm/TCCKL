const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/login', (req, res) => {
  res.render('login', { erro: null });
});

//logando func
router.post('/login', (req, res) => {
    const {email, matricula, senha} = req.body;

    bd.query('SELECT * FROM funcionario WHERE matricula = ?', [matricula], (err, results) => {
        if (err || results.length === 0) {
            return res.render ('login', {erro: 'Matrícula não encontrada.'});
        }

        const usuario = results[0];
        if (usuario.senha !== senha){
            return res.render ('login', {erro: 'Senha incorreta.'});
        }

        //salvando
        req.session.usuario = usuario;
        res.redirect('/func');
    });
});

//logando resp
router.post('/login', (req, res) => {
    const {email, senha} = req.body;

    bd.query('SELECT * FROM responsavel WHERE email = ?', [email], (err, results) => {
        if (err || results.length === 0) {
            return res.render ('login', {erro: 'Email não encontrado.'});
        }

        const usuario = results[0];
        if (usuario.senha !== senha){
            return res.render ('login', {erro: 'Senha incorreta.'});
        }

        //salvando
        req.session.usuario = usuario;
        res.redirect('/resp');
    });
});

module.exports = router;