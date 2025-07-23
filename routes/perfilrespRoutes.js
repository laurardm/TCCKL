const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /perfil - renderiza a página com dados completos do responsável
router.get('/', (req, res) => {
  const responsaveis = req.session.usuario;

  if (!responsaveis) {
    // Usuário não está logado, redireciona para login ou página inicial
    return res.redirect('/');
  }

  const sql = `
    SELECT r.*, p.descricao AS descricao_parentesco, g.descricao AS genero
    FROM responsaveis r LEFT JOIN parentesco p ON p.cod = r.parentesco
    LEFT JOIN genero g ON r.genero = g.cod WHERE r.cod = ?`;

  db.query(sql, [responsaveis.cod], (err, results) => {
    if (err || results.length === 0) {
      console.error('Erro ao buscar dados do responsável:', err);
      return res.render('perfis/perfilr', {
        nome: responsaveis.nome,
        data_nasc: responsaveis.data_nasc,
        email: responsaveis.email,
        genero: '',
        parentesco: '',
        erro: 'Erro ao carregar dados.'
      });
    }

    const dados = results[0];

    //para data_nasc funcionar
    const formatarData = (data) => {
      const d = new Date(data);
      const ano = d.getFullYear();
      const mes = String(d.getMonth() + 1).padStart(2, '0');
      const dia = String(d.getDate()).padStart(2, '0');
      return `${ano}-${mes}-${dia}`;
    };

    res.render('perfis/perfilr', {
      nome: dados.nome,
      data_nasc: formatarData(dados.data_nasc),
      email: dados.email,
      genero: dados.genero || 'Não informado',
      parentesco: dados.descricao_parentesco || 'Nenhum parentesco vinculado',
      erro: null
    });
  });
});

// POST /perfil - atualiza dados do responsável
router.post('/', (req, res) => {
  if (!req.session.usuario) {
    return res.redirect('/');
  }

  const responsaveis = req.session.usuario;
  const { nome, data_nasc, email } = req.body;

  const sqlUpdateResp = `
    UPDATE responsaveis
    SET nome = ?, data_nasc = ?, email = ?
    WHERE cod = ?`;

  db.query(sqlUpdateResp, [nome, data_nasc, email, responsaveis.cod], (err, result) => {
    if (err) {
      console.error('Erro ao atualizar dados do responsável:', err);
      return res.render('perfis/perfilr', {
        nome,
        data_nasc,
        email,
        genero: responsaveis.genero || '',
        parentesco: responsaveis.parentesco || '',
        erro: 'Erro ao atualizar dados.'
      });
    }

    // Atualiza também o login (email) na tabela usuario
    const sqlUpdateUsuario = `
      UPDATE usuario
      SET login = ?
      WHERE cod_responsavel = ?`;

    db.query(sqlUpdateUsuario, [email, responsaveis.cod], (err2, result2) => {
      if (err2) {
        console.error('Erro ao atualizar login na tabela usuario:', err2);
        return res.render('perfis/perfilr', {
          nome,
          data_nasc,
          email,
          genero: responsaveis.genero || '',
          parentesco: responsaveis.parentesco || '',
          erro: 'Dados do responsável foram atualizados, mas houve erro ao atualizar login.'
        });
      }

      // Atualiza sessão
      req.session.usuario.nome = nome;
      req.session.usuario.data_nasc = data_nasc;
      req.session.usuario.email = email;

      res.redirect('/perfilr');
    });
  });
});


module.exports = router;
