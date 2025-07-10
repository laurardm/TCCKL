const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /perfil - renderiza a página com dados do funcionário e turma
router.get('/', (req, res) => {
  if (!req.session.usuario) {
    return res.redirect('/');
  }

  const funcionario = req.session.usuario;

  // Busca o nome da turma pelo id guardado em funcionario.turma
  const sqlTurma = 'SELECT nome FROM turma WHERE cod = ?';

  db.query(sqlTurma, [funcionario.turma], (err, results) => {
    if (err) {
      console.error('Erro ao buscar turma:', err);
      return res.render('perfil/perfil', {
        nome: funcionario.nome,
        data_nasc: funcionario.data_nasc,
        email: funcionario.email,
        celular: funcionario.telefone,
        turmas: 'Erro ao carregar turma',
        erro: null
      });
    }

    const nomeTurma = results.length > 0 ? results[0].nome : 'Nenhuma turma vinculada';

    res.render('perfil/perfil', {
      nome: funcionario.nome,
      data_nasc: funcionario.data_nasc,
      email: funcionario.email,
      celular: funcionario.telefone,
      turmas: nomeTurma,
      erro: null
    });
  });
});

// POST /perfil - atualiza dados do funcionário no banco e na sessão
router.post('/', (req, res) => {
  if (!req.session.usuario) {
    return res.redirect('/');
  }

  const funcionario = req.session.usuario;
  const { nome, data_nasc, email, telefone } = req.body;

  // Atualiza os dados no banco (certifique-se que 'cod' é o id do funcionário)
  const sqlUpdate = `
    UPDATE funcionario
    SET nome = ?, data_nasc = ?, email = ?, telefone = ?
    WHERE cod = ?`;

  db.query(sqlUpdate, [nome, data_nasc, email, telefone, funcionario.cod], (err, result) => {
    if (err) {
      console.error('Erro ao atualizar dados:', err);

      // Se erro, renderiza a página com os dados enviados e mensagem de erro
      return res.render('perfil/perfil', {
        nome,
        data_nasc: data_nasc,
        email,
        celular: telefone,
        turmas: funcionario.turma,
        erro: 'Erro ao atualizar dados.'
      });
    }

    // Atualiza os dados na sessão
    req.session.usuario.nome = nome;
    req.session.usuario.data_nasc = data_nasc;
    req.session.usuario.email = email;
    req.session.usuario.telefone = telefone;

    // Redireciona para GET /perfil para mostrar os dados atualizados
    res.redirect('/perfil');
  });
});

module.exports = router;
